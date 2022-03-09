import { StoreAdministrator } from "../react/store/administrator/storeAdministrator";
import { PROXY_HANDLER_TYPE } from "src/constant";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";

export class StoreForConsumerComponentProxy implements ProxyHandler<object> {
  get(target: object, propertyKey: PropertyKey, receiver: unknown) {
    if (propertyKey === PROXY_HANDLER_TYPE) {
      return StoreForConsumerComponentProxy;
    }

    const storeAdmin = StoreAdministrator.get(target);

    if (storeAdmin?.propertyKeysManager.propertyKeys.has(propertyKey)) {
      const value = storeAdmin?.propertyKeysManager.propertyKeys
        .get(propertyKey)
        ?.getValue("State");

      return (
        StoreAdministrator.get(getUnproxiedValue(value))?.instanceForComponents ||
        value
      );
    }

    if (storeAdmin?.gettersManager.getters.has(propertyKey)) {
      return storeAdmin.gettersManager.getters.get(propertyKey)?.getValue("State");
    }

    return Reflect.get(target, propertyKey, receiver);
  }

  set(target: object, propertyKey: PropertyKey) {
    console.error(
      `Mutating (${
        target.constructor.name
      }.${propertyKey.toString()}) store properties from outside of store class is not valid.`
    );
    return true;
  }
}
