import React from "react";
import { STORE_ADMINISTRATION } from "src/constant";
import { getFromContainer } from "src/container/container";
import { PROXIED_VALUE } from "src/proxy/proxyValueAndSaveIt";
import { ReactApplicationContext } from "src/react/appContext";
import { StoreAdministration } from "src/react/store/storeAdministration";
import { getStoreAdministration } from "src/utils/utils";

export function Store(): ClassDecorator {
  return function (StoreType: any) {
    // Override Store class to
    // 1. make class properties observable
    class ImprovedStoreType extends StoreType {
      constructor(...args: any) {
        super(...args);

        // first set default values to store admin
        const storeAdmin =
          getStoreAdministration(this) ||
          ((this as any)[STORE_ADMINISTRATION] = new StoreAdministration());

        Object.keys(this).map((propertyKey) => {
          storeAdmin.instancePropsValue.set(propertyKey, this[propertyKey]);

          // Define setter and getter
          // to intercept this props getting and
          // return proxied value
          Object.defineProperty(this, propertyKey, {
            enumerable: true,
            configurable: true,
            get() {
              const storeAdmin = getStoreAdministration(this);
              const value = storeAdmin?.instancePropsValue.get(propertyKey);
              return value?.[PROXIED_VALUE] || value;
            },
            set(value: any) {
              const storeAdmin = getStoreAdministration(this);
              storeAdmin?.instancePropsValue.set(propertyKey, value);
              storeAdmin?.renderConsumers();
            },
          });
        });
      }
    }

    // change constructor name for improve debugging
    Reflect.defineProperty(ImprovedStoreType, "name", {
      writable: false,
      value: StoreType.name,
    });

    const context = React.createContext<StoreAdministration | null>(null);
    context.displayName = `${StoreType.name}`;
    // store context provider in app container
    // to use context ref in useStore to get context value
    getFromContainer(ReactApplicationContext).registerStoreContext(
      ImprovedStoreType,
      context
    );

    return ImprovedStoreType;
  } as any;
}
