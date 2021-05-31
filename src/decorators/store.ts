import React from "react";
import { STORE_ADMINISTRATION } from "src/constant";
import { getFromContainer } from "src/container/container";
import { PROXIED_VALUE } from "src/proxy/proxyValueAndSaveIt";
import { ReactApplicationContext } from "src/react/appContext";
import { StoreAdministrator } from "src/react/store/storeAdministrator";
import { getStoreAdministrator } from "src/utils/utils";

export function Store(): ClassDecorator {
  return function (StoreType: any) {
    const EnhancedStoreType = createEnhancedStoreType(StoreType);

    const context = React.createContext<StoreAdministrator | null>(null);
    context.displayName = `${StoreType.name}`;
    // store context provider in app container
    // to use context ref in useStore to get context value
    getFromContainer(ReactApplicationContext).registerStoreContext(
      EnhancedStoreType,
      context
    );

    return EnhancedStoreType;
  } as any;
}

export const createEnhancedStoreType = (StoreType: any) => {
  // Override Store class to
  // 1. make class properties observable
  const EnhancedStoreType = class extends StoreType {
    constructor(...args: any) {
      super(...args);

      // first set default values to store admin
      const storeAdmin = new StoreAdministrator(this);
      Reflect.set(this, STORE_ADMINISTRATION, storeAdmin);

      Object.keys(this).forEach((propertyKey) => {
        storeAdmin.propertyKeysValue.set(propertyKey, this[propertyKey]);

        // Define setter and getter
        // to intercept this props getting and
        // return proxied value
        Object.defineProperty(this, propertyKey, {
          enumerable: true,
          configurable: true,
          get() {
            const storeAdmin = getStoreAdministrator(this);
            const value = storeAdmin?.propertyKeysValue.get(propertyKey);
            return value?.[PROXIED_VALUE] || value;
          },
          set(value: any) {
            const storeAdmin = getStoreAdministrator(this);
            storeAdmin?.propertyKeysValue.set(propertyKey, value);
            storeAdmin?.renderConsumers();
          },
        });
      });
    }
  } as any;
  // change constructor name for improve debugging
  Reflect.defineProperty(EnhancedStoreType, "name", {
    writable: false,
    value: StoreType.name,
  });

  return EnhancedStoreType;
};
