import { ObservableProperty } from "../propertyKeys/observableProperty";
import { StoreAdministrator } from "../storeAdministrator";
import { adtProxyBuilder } from "src/proxy/adtProxy/adtProxyBuilder";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";

/**
 * Effect context must be proxied to use value from state insteadOf store
 * because we have hooks like useDeferreValue or useTransition can others hooks cause
 * rerenders but these hooks value not change in that render
 * So we must bind effect context to state values.
 */
export class EffectProxy implements ProxyHandler<object> {
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

    /**
     * Here we switch effect context to `State`
     * There is question why we need it?
     */
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
          (
            this.storeAdmin.propertyKeysManager.propertyKeys.get(
              propertyKey
            ) as ObservableProperty
          )?.doOnSet(),
      });
    }

    // Getters
    if (this.storeAdmin?.gettersManager.getters.has(propertyKey)) {
      return this.storeAdmin.gettersManager.getters
        .get(propertyKey)
        ?.getValue("State");
    }

    /**
     * Methods should bind to effect context:
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
