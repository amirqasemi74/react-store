import { StoreAdministrator } from "../storeAdministrator";
import { ObservableProperty } from "./observableProperty";
import { useState } from "react";
import { InjectableMetadataUtils } from "src/container/decorators/Injectable";
import { HooksMetadataUtils } from "src/decorators/hook";
import { StorePropsMetadataUtils } from "src/decorators/props";
import { StoreMetadataUtils } from "src/decorators/store";
import { WireMetadataUtils } from "src/decorators/wire";
import { deepUnproxy } from "src/proxy/deepUnproxy";
import { GetSetPathsCalculator } from "src/utils/getSetPathsCalculator";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";
import { useFixedLazyRef } from "src/utils/useLazyRef";

export class StorePropertyKeysManager {
  readonly propertyKeys = new Map<PropertyKey, ObservableProperty>();

  accessedProperties: AccessedProperty[] = [];

  collectAccessPathLogs = true;

  private readonly readonlyPropertyKeys: Array<{
    matcher: (propertyKey: PropertyKey) => boolean;
    onSet: (propertyKey: PropertyKey) => void;
  }> = [];

  constructor(private storeAdmin: StoreAdministrator) {
    // @Props
    this.readonlyPropertyKeys.push({
      matcher: (propertyKey) =>
        StorePropsMetadataUtils.is(storeAdmin.type, propertyKey),
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is decorated with \`@Props()\`, so can't be mutated.`
        ),
    });
    // @Wire
    this.readonlyPropertyKeys.push({
      matcher: (propertyKey) =>
        WireMetadataUtils.is(this.storeAdmin.type, propertyKey),
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is decorated with \`@Wire(...)\` or \`@AutoWire()\`, so can't be mutated.`
        ),
    });

    // @Hook
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
    this.readonlyPropertyKeys.push({
      matcher: (propertyKey) => {
        this.turnOffCollectAccessPathLogs();
        const type = getUnproxiedValue(
          this.storeAdmin.instance[propertyKey]
        )?.constructor;
        this.turnOnCollectAccessPathLogsIfNeeded();
        return type && InjectableMetadataUtils.is(type);
      },
      onSet: (propertyKey) =>
        console.error(
          `\`${
            this.storeAdmin.type.name
          }.${propertyKey.toString()}\` is an injected @Injectable() , so can't be mutated.`
        ),
    });
    // Injected Stores
    const storeMatcher = (propertyKey: PropertyKey) => {
      this.turnOffCollectAccessPathLogs();
      const type = getUnproxiedValue(
        this.storeAdmin.instance[propertyKey]
      )?.constructor;
      this.turnOnCollectAccessPathLogsIfNeeded();
      return type && StoreMetadataUtils.is(type);
    };
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
      const isReadOnly = this.readonlyPropertyKeys.some(({ matcher }) =>
        matcher(propertyKey)
      );

      this.propertyKeys.set(
        propertyKey,
        new ObservableProperty(
          this.storeAdmin,
          this.storeAdmin.instance[propertyKey],
          isReadOnly
        )
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
    value = deepUnproxy(value);
    this.addAccessedProperty({
      value,
      propertyKey,
      type: "SET",
      target: this.storeAdmin.instance,
    });

    const info = this.propertyKeys.get(propertyKey)!;
    const preValue = info?.getValue("Store");
    const readonlyProperty = this.readonlyPropertyKeys.find(({ matcher }) =>
      matcher(propertyKey)
    );

    if (readonlyProperty && !force) {
      readonlyProperty?.onSet(propertyKey);
    } else {
      info.setValue(value, "Store", !!readonlyProperty);
    }

    // Props property key must not affect renders status at all.
    if (!readonlyProperty || force) {
      info.isSetStatePending = !readonlyProperty;
      const purePreValue = getUnproxiedValue(Object(preValue)) || preValue;
      if (purePreValue !== value) {
        this.storeAdmin.renderConsumers(force);
      }
    }
  }

  hasPendingSetStates() {
    return Array.from(this.propertyKeys.values()).some(
      (info) => info.isSetStatePending
    );
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
          Array.from(this.propertyKeys.values()).filter((info) => !info.isReadOnly)
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
    if (!this.collectAccessPathLogs) return;
    this.accessedProperties.push({
      ...ap,
      value:
        ap.value && typeof ap.value === "object"
          ? getUnproxiedValue(ap.value)
          : ap.value,
    });
  }

  turnOffCollectAccessPathLogs() {
    this.collectAccessPathLogs = false;
  }

  /**
   * If there is not AutoEffect, Computed Property and store not injected
   * to any other store, access paths logs should not collect due to better performance
   */
  turnOnCollectAccessPathLogsIfNeeded() {
    const adm = this.storeAdmin;
    this.collectAccessPathLogs = !(
      adm.gettersManager.getters.size === 0 &&
      adm.effectsManager.effectsMetaData.every((md) => !md.options.auto) &&
      adm.injectedInTos.size === 0
    );
  }

  calcPaths() {
    const calculator = new GetSetPathsCalculator(this.storeAdmin, [
      ...this.accessedProperties,
    ]);
    this.turnOffCollectAccessPathLogs();
    const paths = calculator.calcPaths();
    this.turnOnCollectAccessPathLogsIfNeeded();
    return paths;
  }
}

export interface AccessedProperty {
  target: object;
  value: unknown;
  propertyKey: PropertyKey;
  type: "SET" | "GET";
}

export type AccessedPath = PropertyKey[];
