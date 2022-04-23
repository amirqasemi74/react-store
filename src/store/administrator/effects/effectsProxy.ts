import { StoreAdministrator } from "../storeAdministrator";
import { adtProxyBuilder } from "src/proxy/adtProxy/adtProxyBuilder";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";

export class EffectProxy implements ProxyHandler<object> {
  directMutatedStoreProperties = new Map<PropertyKey, unknown>();

  constructor(private storeAdmin: StoreAdministrator) {}

  get(target: object, propertyKey: PropertyKey, receiver: unknown) {
    if (this.directMutatedStoreProperties.has(propertyKey)) {
      return this.directMutatedStoreProperties.get(propertyKey);
    }

    // Property Key
    if (this.storeAdmin?.propertyKeysManager.propertyKeys.has(propertyKey)) {
      const value = this.storeAdmin?.propertyKeysManager.propertyKeys
        .get(propertyKey)
        ?.getValue("State");

      if (StoreAdministrator.get(getUnproxiedValue(value))) {
        return StoreAdministrator.get(getUnproxiedValue(value))?.effectsManager
          .context;
      }

      return adtProxyBuilder({
        value,
        proxiedValuesStorage: new Map(),
        onSet: () =>
          this.storeAdmin.propertyKeysManager.propertyKeys
            .get(propertyKey)
            ?.doOnSet(),
      });
    }

    // Getters
    if (this.storeAdmin?.gettersManager.getters.has(propertyKey)) {
      return this.storeAdmin.gettersManager.getters
        .get(propertyKey)
        ?.getValue("State");
    }

    /**
     * There is no need to bind methods to effect context because when we call method in
     * effect context using this keyword, the method is automatically bind to effect context
     */

    return Reflect.get(target, propertyKey, receiver);
  }

  set(target: object, propertyKey: PropertyKey, value: unknown) {
    this.storeAdmin?.propertyKeysManager.onSetPropertyKey(propertyKey, value);
    this.directMutatedStoreProperties.set(propertyKey, value);
    return true;
  }
}
