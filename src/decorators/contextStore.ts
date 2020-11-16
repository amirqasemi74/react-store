import React from "react";
import { STORE_ADMINISTRATION } from "src/constant";
import { getFromContainer } from "src/container";
import { PROXYED_VALUE } from "src/proxy/proxyValueAndSaveIt";
import ReactAppContext from "src/react/appContext";
import StoreAdministration from "src/react/storeAdministration";
import { getStoreAdministration } from "src/utils/utils";

export default function ContextStore(): ClassDecorator {
  return function (StoreType: any) {
    // Override Store class to
    // 1. make class properties observable
    class ImprovedStoreType extends StoreType {
      constructor(...args: any) {
        super(...args);

        Object.keys(this).map((propertyKey) => {
          // first set default values to store admin
          const storeAdmin =
            getStoreAdministration(this) ||
            ((this as any)[STORE_ADMINISTRATION] = new StoreAdministration());
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
              return value?.[PROXYED_VALUE] || value;
            },
            set(value: any) {
              getStoreAdministration(this)?.instancePropsValue.set(
                propertyKey,
                value
              );
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
    getFromContainer(ReactAppContext).registerStoreContext(
      ImprovedStoreType,
      context
    );

    return ImprovedStoreType;
  } as any;
}
