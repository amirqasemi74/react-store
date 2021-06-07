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

      const methods = getMethodsPropertyDescriptors(this);

      Object.keys(methods)
        .filter((key) => key !== "constructor")
        .forEach((methodKey) => {
          const descriptor: PropertyDescriptor = methods[methodKey];
          console.log(methodKey);

          const fn = function (this: any, ...args: any) {
            return getStoreAdministrator(this)?.runAction(() =>
              descriptor.value.call(this, args)
            );
          };

          Object.defineProperty(this, methodKey, {
            enumerable: false,
            configurable: true,
            get() {
              const storeAdmin = getStoreAdministrator(this);
              const value = storeAdmin?.propertyKeysValue.get(methodKey);

              // it first access value is undefined because proxied function
              // has to not been sed yet and only descriptor.value has fn ref.
              // console.log();

              return value?.[PROXIED_VALUE] || value || descriptor.value;
            },
            set(value: any) {
              const storeAdmin = getStoreAdministrator(this);
              storeAdmin?.propertyKeysValue.set(methodKey, value);
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

const getMethodsPropertyDescriptors = (o: any) => {
  const _get = (o: any, methods = {}) => {
    const proto = Object.getPrototypeOf(o);
    if (proto && proto !== Object.prototype) {
      methods = { ...methods, ...Object.getOwnPropertyDescriptors(proto) };
      return _get(proto, methods);
    } else {
      return methods;
    }
  };
  return _get(o);
};
