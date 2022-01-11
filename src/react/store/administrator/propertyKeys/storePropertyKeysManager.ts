import type { StoreAdministrator } from "../storeAdministrator";
import { StorePropertyKey } from "./storePropertyKey";
import { useState } from "react";
import { StorePropsMetadataUtils } from "src/decorators/props";
import { WireMetadataUtils } from "src/decorators/wire";
import adtProxyBuilder from "src/proxy/adtProxy/adtProxyBuilder";
import { isPrimitive } from "src/utils/isPrimitive";
import { useFixedLazyRef } from "src/utils/useLazyRef";

export class StorePropertyKeysManager {
  propertyKeys = new Map<PropertyKey, StorePropertyKey>();

  private policies: SetPropertyPolicy[] = [];

  constructor(private storeAdmin: StoreAdministrator) {
    // @Props
    this.policies.push({
      matcher: (propertyKey) =>
        StorePropsMetadataUtils.is(storeAdmin.type, propertyKey),
      render: false,
      set: "ORIGINAL",
    });

    //@Wire
    this.policies.push({
      matcher: (propertyKey) =>
        WireMetadataUtils.is(this.storeAdmin.type, propertyKey),
      render: false,
      set: "NONE",
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
        case "ORIGINAL":
        case "NONE":
          break;
        case "OBSERVABLE":
        case undefined:
          value = this.makeDeepObservable(propertyKey, value);
          break;
      }
      this.propertyKeys.set(propertyKey, new StorePropertyKey(value));

      // Define setter and getter
      // to intercept this props getting and
      // return proxied value
      Object.defineProperty(this.storeAdmin.instance, propertyKey, {
        enumerable: true,
        configurable: true,
        get: () => this.onGetPropertyKey(propertyKey),
        set: (value: any) => this.onSetPropertyKey(propertyKey, value),
      });
    });
  }

  private onGetPropertyKey(propertyKey: PropertyKey) {
    return this.propertyKeys.get(propertyKey)?.getValue("Store");
  }

  private onSetPropertyKey(propertyKey: PropertyKey, value: any) {
    // TODO write test for props
    const info = this.propertyKeys.get(propertyKey);
    const preValue = info?.getValue("Store");

    const matchedPolicy = this.policies.find(({ matcher }) => matcher(propertyKey));

    switch (matchedPolicy?.set) {
      case "ORIGINAL":
        info?.setValue(value, "Store");
        matchedPolicy?.onSet?.(propertyKey);
        break;
      case "NONE":
        matchedPolicy?.onSet?.(propertyKey);
        break;
      case "OBSERVABLE":
      case undefined:
        info?.setValue(this.makeDeepObservable(propertyKey, value), "Store");
        matchedPolicy?.onSet?.(propertyKey);
        break;
    }

    // Props property key must not affect renders status at all.
    if (!matchedPolicy || matchedPolicy.render) {
      const info = this.propertyKeys.get(propertyKey);
      info?.reactSetState?.(info.getValue("Store"));
      if (isPrimitive(value)) {
        if (preValue !== value) {
          this.storeAdmin.renderConsumers(true);
        }
      } else {
        this.storeAdmin.renderConsumers(true);
      }
    }
  }

  private makeDeepObservable(propertyKey: PropertyKey, value: any) {
    return adtProxyBuilder({
      value,
      onSet: () => {
        const info = this.propertyKeys.get(propertyKey);
        info?.reactSetState?.(info.getValue("Store"));
        this.storeAdmin.renderConsumers(true);
      },
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
          Array.from(
            this.storeAdmin.propertyKeysManager.propertyKeys.entries()
          ).filter(
            ([propertyKey]) =>
              !WireMetadataUtils.is(this.storeAdmin.type, propertyKey)
          )
        );
        propertyKeysInfo.forEach(([, info]) => {
          const [state, setState] = useState(() =>
            info.isPrimitive ? info.getValue("Store") : { $: info.getValue("Store") }
          );
          info.setValue(state, "State");
          info.reactSetState = setState;
        });
      },
    });
  }
}

interface SetPropertyPolicy {
  matcher: (propertyKey: PropertyKey) => boolean;
  render: boolean;
  set: SetPropertyPolicySetType;
  onSet?: (propertyKey: PropertyKey) => void;
}

type SetPropertyPolicySetType = "ORIGINAL" | "OBSERVABLE" | "NONE";
