import { isPropsPropertyKey } from "src/decorators/props";
import { isStorePart } from "src/decorators/storePart";
import adtProxyBuilder from "src/proxy/adtProxy/adtProxyBuilder";
import { isPrimitive } from "src/utils/isPrimitive";
import { getType } from "src/utils/utils";
import { StorePropertyKey } from "../storePropertyKey";
import type { StoreAdministrator } from "./storeAdministrator";

export class StorePropertyKeysManager {
  propertyKeys = new Map<PropertyKey, StorePropertyKey>();

  private policies: SetPropertyPolicy[] = [];

  constructor(private storeAdmin: StoreAdministrator) {
    this.policies.push({
      matcher: (propertyKey) =>
        isPropsPropertyKey(getType(storeAdmin.instance)!, propertyKey),
      render: false,
      set: "ORIGINAL",
    });

    this.policies.push({
      matcher: (propertyKey) =>
        storeAdmin.instance[propertyKey] &&
        isStorePart(storeAdmin.instance[propertyKey]?.constructor),
      render: false,
      set: "NONE",
      onSet: (propertyKey) =>
        console.error(
          `\`${propertyKey.toString()}\` property key is reassigned. it isn't valid for propertyKeys which is declared for store part`
        ),
    });
  }

  makeAllObservable() {
    Object.keys(this.storeAdmin.instance).forEach((propertyKey) => {
      const self = this;

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
        get: () => self.onGetPropertyKey(propertyKey),
        set: (value: any) => self.onSetPropertyKey(propertyKey, value),
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

    const matchedPolicy = this.policies.find(({ matcher }) =>
      matcher(propertyKey)
    );

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
      info?.reactSetState(info.getValue("Store"));
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
        info?.reactSetState(info.getValue("Store"));
        this.storeAdmin.renderConsumers(true);
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
