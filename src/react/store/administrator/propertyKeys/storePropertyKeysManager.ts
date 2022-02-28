import type { StoreAdministrator } from "../storeAdministrator";
import { Property } from "./property";
import { useState } from "react";
import { TARGET } from "src/constant";
import { InjectableMetadataUtils } from "src/container/decorators/Injectable";
import { HooksMetadataUtils } from "src/decorators/hook";
import { StorePropsMetadataUtils } from "src/decorators/props";
import { StoreMetadataUtils } from "src/decorators/store";
import { WireMetadataUtils } from "src/decorators/wire";
import { adtProxyBuilder } from "src/proxy/adtProxy/adtProxyBuilder";
import { GetSetPathsCalculator } from "src/utils/getSetPathsCalculator";
import { useFixedLazyRef } from "src/utils/useLazyRef";

export class StorePropertyKeysManager {
  readonly propertyKeys = new Map<PropertyKey, Property>();

  private accessedProperties: AccessedProperty[] = [];

  private readonly purePropertyKeyMatchers: Array<
    (propertyKey: PropertyKey) => boolean
  > = [];

  private readonly readonlyPropertyKeys: Array<{
    matcher: (propertyKey: PropertyKey) => boolean;
    onSet: (propertyKey: PropertyKey) => void;
  }> = [];

  constructor(private storeAdmin: StoreAdministrator) {
    // @Props
    const propMatcher = (propertyKey: PropertyKey) =>
      StorePropsMetadataUtils.is(storeAdmin.type, propertyKey);
    this.purePropertyKeyMatchers.push(propMatcher);
    this.readonlyPropertyKeys.push({
      matcher: propMatcher,
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is decorated with \`@Props()\`, so can't be mutated.`
        ),
    });
    // @Wire
    const wireMatcher = (propertyKey: PropertyKey) =>
      WireMetadataUtils.is(this.storeAdmin.type, propertyKey);
    this.purePropertyKeyMatchers.push(wireMatcher);
    this.readonlyPropertyKeys.push({
      matcher: wireMatcher,
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is decorated with \`@Wire(...)\` or \`@AutoWire()\`, so can't be mutated.`
        ),
    });

    // @Hook
    const hookMatcher = (propertyKey) =>
      HooksMetadataUtils.is(this.storeAdmin.type, propertyKey);
    this.purePropertyKeyMatchers.push(hookMatcher);
    this.readonlyPropertyKeys.push({
      matcher: (propertyKey) =>
        HooksMetadataUtils.is(this.storeAdmin.type, propertyKey),
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is decorated with \`@Hook(...)\`, so can't be mutated.`
        ),
    });

    // Injected injectable
    const injectableMatcher = (propertyKey: PropertyKey) => {
      const type = this.storeAdmin.instance[propertyKey]?.constructor;
      return type && InjectableMetadataUtils.is(type);
    };
    this.purePropertyKeyMatchers.push(injectableMatcher);
    this.readonlyPropertyKeys.push({
      matcher: injectableMatcher,
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is an injected @Injectable() , so can't be mutated.`
        ),
    });
    // Injected Stores
    const storeMatcher = (propertyKey: PropertyKey) => {
      const type = this.storeAdmin.instance[propertyKey]?.constructor;
      return type && StoreMetadataUtils.is(type);
    };
    this.purePropertyKeyMatchers.push(storeMatcher);
    this.readonlyPropertyKeys.push({
      matcher: storeMatcher,
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is an injected store, so can't be mutated`
        ),
    });
  }

  makeAllObservable() {
    Object.keys(this.storeAdmin.instance).forEach((propertyKey) => {
      const isPureProperty = this.purePropertyKeyMatchers.some((matcher) =>
        matcher(propertyKey)
      );

      const proxiedValuesStorage = new Map();

      const value = this.makeDeepObservable(
        propertyKey,
        this.storeAdmin.instance[propertyKey],
        proxiedValuesStorage,
        isPureProperty
      );

      this.propertyKeys.set(
        propertyKey,
        new Property(value, proxiedValuesStorage, isPureProperty)
      );

      // Define setter and getter
      // to intercept this props getting and
      // return proxied value
      Object.defineProperty(this.storeAdmin.instance, propertyKey, {
        enumerable: true,
        configurable: true,
        get: () => this.onGetPropertyKey(propertyKey),
        set: (value: unknown) => this.onSetPropertyKey(propertyKey, value),
      });
    });
  }

  private onGetPropertyKey(propertyKey: PropertyKey) {
    const value = this.propertyKeys.get(propertyKey)?.getValue("Store");
    this.addAccessedProperty({
      value,
      type: "GET",
      propertyKey,
      target: this.storeAdmin.instance,
    });
    return value;
  }

  /**
   * @param propertyKey
   * @param value
   * @param force to set props in props handler or developer hooks
   */
  onSetPropertyKey(propertyKey: PropertyKey, value: unknown, force?: boolean) {
    this.addAccessedProperty({
      value,
      propertyKey,
      type: "SET",
      target: this.storeAdmin.instance,
    });

    const info = this.propertyKeys.get(propertyKey)!;
    const preValue = info?.getValue("Store");
    const pureProperty = this.purePropertyKeyMatchers.find((matcher) =>
      matcher(propertyKey)
    );
    const readonlyProperty = this.readonlyPropertyKeys.find(({ matcher }) =>
      matcher(propertyKey)
    );

    if (pureProperty) {
      if (force) {
        info.setValue(
          this.makeDeepObservable(
            propertyKey,
            value,
            info.proxiedValuesStorage,
            true
          ),
          "Store"
        );
      } else {
        readonlyProperty?.onSet(propertyKey);
      }
    } else {
      if (readonlyProperty && !force) {
        readonlyProperty.onSet(propertyKey);
      } else {
        info.setValue(
          this.makeDeepObservable(
            propertyKey,
            value,
            info.proxiedValuesStorage,
            false
          ),
          "Store"
        );
      }
    }

    this.storeAdmin.gettersManager.recomputedGetters();

    // Props property key must not affect renders status at all.
    if (!pureProperty || force) {
      info.isSetStatePending = true;
      const purePreValue = Reflect.get(Object(preValue), TARGET) || preValue;
      if (purePreValue !== value) {
        this.storeAdmin.renderConsumers();
      }
    }
  }

  private makeDeepObservable(
    propertyKey: PropertyKey,
    value: unknown,
    proxiedValuesStorage: Map<unknown, unknown>,
    readonly: boolean
  ) {
    return adtProxyBuilder({
      value,
      proxiedValuesStorage,
      onAccess: this.addAccessedProperty.bind(this),
      onSet: () => {
        this.storeAdmin.gettersManager.recomputedGetters();
        const info = this.propertyKeys.get(propertyKey);
        if (info) {
          info.isSetStatePending = true;
        }

        if (!readonly) {
          this.storeAdmin.renderConsumers();
        }
      },
    });
  }

  doPendingSetStates() {
    this.propertyKeys.forEach((info) => {
      if (info.isSetStatePending) {
        info.reactSetState?.();
      }
    });
  }
  /**
   * *********************** Store UseStates ******************************
   */
  registerUseStates() {
    this.storeAdmin.hooksManager.reactHooks.add({
      when: "AFTER_INSTANCE",
      hook: () => {
        const propertyKeysInfo = useFixedLazyRef(() =>
          Array.from(this.propertyKeys.values()).filter((info) => !info.isPure)
        );
        propertyKeysInfo.forEach((info) => {
          const [state, setState] = useState(() =>
            info.isPrimitive ? info.getValue("Store") : { $: info.getValue("Store") }
          );
          info.setValue(state, "State");
          info.setReactSetState(setState);
        });
      },
    });
  }

  /**
   * *********************** Accessed Paths ******************************
   */
  clearAccessedProperties() {
    this.accessedProperties = [];
  }

  addAccessedProperty(ap: AccessedProperty) {
    this.accessedProperties.push({
      ...ap,
      value: ap.value && typeof ap.value === "object" ? ap.value[TARGET] : ap.value,
    });
  }

  calcPaths() {
    const calculator = new GetSetPathsCalculator(
      this.storeAdmin.instance,
      this.accessedProperties
    );
    return calculator.calcPaths();
  }
}

export interface AccessedProperty {
  target: object;
  value: unknown;
  propertyKey: PropertyKey;
  type: "SET" | "GET";
}

export type AccessedPath = PropertyKey[];
