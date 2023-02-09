import { StoreAdministrator } from "../storeAdministrator";

/**
 * Effect context must be proxied to use value from state insteadOf store
 * because we have hooks like useDeferredValue or useTransition can others hooks cause
 * rerenders but these hooks value not change in that render
 * So we must bind effect context to state values.
 */
export class MethodProxyHandler implements ProxyHandler<object> {
  directMutatedStoreProperties = new Map<PropertyKey, unknown>();

  constructor(private storeAdmin: StoreAdministrator) {}

  get(target: object, propertyKey: PropertyKey, receiver: unknown) {
    /**
     * Because we change effect context to state if we set value it will be
     * done async and if we read the value immediately it doesn't work
     * so we make trick here only for primitive types
     */
    if (this.directMutatedStoreProperties.has(propertyKey)) {
      return this.directMutatedStoreProperties.get(propertyKey);
    }

    if (this.storeAdmin?.propertyKeysManager.propertyKeys.has(propertyKey)) {
      return this.storeAdmin?.propertyKeysManager.propertyKeys
        .get(propertyKey)
        ?.getValue("State", false);
    }

    // Getters
    if (this.storeAdmin?.gettersManager.getters.has(propertyKey)) {
      return this.storeAdmin.gettersManager.getters
        .get(propertyKey)
        ?.getValue("State");
    }

    return Reflect.get(target, propertyKey, receiver);
  }

  set(_: object, propertyKey: PropertyKey, value: unknown) {
    if (this.storeAdmin?.propertyKeysManager.onSetPropertyKey(propertyKey, value)) {
      this.directMutatedStoreProperties.set(
        propertyKey,
        this.storeAdmin.propertyKeysManager.propertyKeys
          .get(propertyKey)
          ?.getValue("Store")
      );
    }
    return true;
  }
}
