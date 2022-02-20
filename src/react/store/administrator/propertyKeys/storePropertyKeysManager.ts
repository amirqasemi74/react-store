import type { StoreAdministrator } from "../storeAdministrator";
import { ObservableProperty } from "./observableProperty";
import { useState } from "react";
import { TARGET } from "src/constant";
import { StorePropsMetadataUtils } from "src/decorators/props";
import { WireMetadataUtils } from "src/decorators/wire";
import { adtProxyBuilder } from "src/proxy/adtProxy/adtProxyBuilder";
import { GetSetPathsCalculator } from "src/utils/getSetPathsCalculator";
import { useFixedLazyRef } from "src/utils/useLazyRef";

export class StorePropertyKeysManager {
  readonly propertyKeys = new Map<PropertyKey, ObservableProperty>();

  private accessedProperties: AccessedProperty[] = [];

  private readonly policies: SetPropertyPolicy[] = [];

  constructor(private storeAdmin: StoreAdministrator) {
    // @Props
    this.policies.push({
      matcher: (propertyKey) =>
        StorePropsMetadataUtils.is(storeAdmin.type, propertyKey),
      set: "OBSERVABLE-READONLY",
    });

    //@Wire
    this.policies.push({
      matcher: (propertyKey) =>
        WireMetadataUtils.is(this.storeAdmin.type, propertyKey),
      set: "OBSERVABLE-READONLY",
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is decorated with \`@Wire(...)\` or \`@AutoWire()\`, so can't be mutated.`
        ),
    });
  }

  makeAllObservable() {
    Object.keys(this.storeAdmin.instance).forEach((propertyKey) => {
      const policy = this.policies.find(({ matcher }) => matcher(propertyKey));
      let value = this.storeAdmin.instance[propertyKey];

      switch (policy?.set) {
        case "OBSERVABLE-READONLY":
          value = this.makeDeepObservable(propertyKey, value, true);
          break;
        case "OBSERVABLE":
        case undefined:
          value = this.makeDeepObservable(propertyKey, value, false);
          break;
      }
      this.propertyKeys.set(propertyKey, new ObservableProperty(value));

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
   *
   * @param propertyKey
   * @param value
   * @param force to set props in props handler
   */
  onSetPropertyKey(propertyKey: PropertyKey, value: unknown, force = false) {
    this.addAccessedProperty({
      value,
      propertyKey,
      type: "SET",
      target: this.storeAdmin.instance,
    });
    const info = this.propertyKeys.get(propertyKey);
    const preValue = info?.getValue("Store");

    const matchedPolicy = this.policies.find(({ matcher }) => matcher(propertyKey));

    switch (matchedPolicy?.set) {
      case "OBSERVABLE-READONLY": {
        if (force) {
          info?.setValue(this.makeDeepObservable(propertyKey, value, true), "Store");
        } else {
          matchedPolicy?.onSet?.(propertyKey);
        }
        break;
      }
      case "OBSERVABLE":
      case undefined:
        info?.setValue(this.makeDeepObservable(propertyKey, value, false), "Store");
        matchedPolicy?.onSet?.(propertyKey);
        break;
    }

    this.storeAdmin.gettersManager.recomputedGetters();

    // Props property key must not affect renders status at all.
    if (!matchedPolicy || matchedPolicy.set === "OBSERVABLE") {
      if (info) {
        info.isSetStatePending = true;
      }
      const purePreValue = Reflect.get(Object(preValue), TARGET) || preValue;
      if (purePreValue !== value) {
        this.storeAdmin.renderConsumers();
      }
    }
  }

  private makeDeepObservable(
    propertyKey: PropertyKey,
    value: unknown,
    readonly: boolean
  ) {
    return adtProxyBuilder({
      value,
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
    this.storeAdmin.reactHooks.add({
      when: "AFTER_INSTANCE",
      hook: () => {
        const propertyKeysInfo = useFixedLazyRef(() =>
          Array.from(this.propertyKeys.entries()).filter(
            ([propertyKey]) =>
              !WireMetadataUtils.is(this.storeAdmin.type, propertyKey) &&
              !StorePropsMetadataUtils.is(this.storeAdmin.type, propertyKey)
          )
        );
        propertyKeysInfo.forEach(([, info]) => {
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

interface SetPropertyPolicy {
  matcher: (propertyKey: PropertyKey) => boolean;
  set: SetPropertyPolicySetType;
  onSet?: (propertyKey: PropertyKey) => void;
}

type SetPropertyPolicySetType = "OBSERVABLE-READONLY" | "OBSERVABLE";

export interface AccessedProperty {
  target: object;
  value: unknown;
  propertyKey: PropertyKey;
  type: "SET" | "GET";
}

export type AccessedPath = PropertyKey[];
