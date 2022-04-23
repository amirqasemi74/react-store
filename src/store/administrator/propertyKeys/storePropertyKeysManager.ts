import { StoreAdministrator } from "../storeAdministrator";
import { ObservableProperty } from "./observableProperty";
import { useState } from "react";
import { InjectableMetadataUtils } from "src/container/decorators/Injectable";
import { HooksMetadataUtils } from "src/decorators/hook";
import { StorePropsMetadataUtils } from "src/decorators/props";
import { StoreMetadataUtils } from "src/decorators/store";
import { WireMetadataUtils } from "src/decorators/wire";
import { deepUnproxy } from "src/proxy/deepUnproxy";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";
import { useFixedLazyRef } from "src/utils/useLazyRef";

export class StorePropertyKeysManager {
  readonly propertyKeys = new Map<PropertyKey, ObservableProperty>();

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
        const type = getUnproxiedValue(
          this.storeAdmin.instance[propertyKey]
        )?.constructor;
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
      const type = getUnproxiedValue(
        this.storeAdmin.instance[propertyKey]
      )?.constructor;
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
    return value;
  }

  /**
   * @param propertyKey
   * @param value
   * @param force to set props in props handler or developer hooks
   */
  onSetPropertyKey(propertyKey: PropertyKey, value: unknown, force?: boolean) {
    value = deepUnproxy(value);
    const info = this.propertyKeys.get(propertyKey)!;
    const preValue = info?.getValue("Store");

    if (info.isReadOnly && !force) {
      this.readonlyPropertyKeys
        .find(({ matcher }) => matcher(propertyKey))
        ?.onSet(propertyKey);
    } else {
      info.setValue(value, "Store");
    }

    // Props property key must not affect renders status at all.
    if (!info.isReadOnly || force) {
      info.isSetStatePending = !info.isReadOnly;
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
}
