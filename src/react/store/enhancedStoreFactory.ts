import { STORE_ADMINISTRATION } from "src/constant";
import { isPropsPropertyKey } from "src/decorators/props";
import adtProxyBuilder from "src/proxy/adtProxy/adtProxyBuilder";
import { StoreAdministrator } from "src/react/store/storeAdministrator";
import { getStoreAdministrator, getType } from "src/utils/utils";
import { StorePropertyKey } from "./storePropertyKey";

export class EnhancedStoreFactory {
  static create(StoreType: any) {
    // Override Store class to
    // 1. make class properties observable
    const EnhancedStoreType = class extends StoreType {
      constructor(...args: any) {
        super(...args);

        // first set default values to store admin
        Reflect.set(this, STORE_ADMINISTRATION, new StoreAdministrator(this));

        EnhancedStoreFactory.makePropertyKeysObservable(this);
        EnhancedStoreFactory.makeMethodsAsActions(this);
      }
    } as any;

    // change constructor name for improve debugging
    Reflect.defineProperty(EnhancedStoreType, "name", {
      writable: false,
      value: StoreType.name,
    });

    return EnhancedStoreType;
  }

  /**
   * ************************************************************
   * ************** Observable Property keys ********************
   * ************************************************************
   */
  private static makePropertyKeysObservable(storeThis: any) {
    const storeAdmin = getStoreAdministrator(storeThis);

    const makeDeepObservable = (propertyKey: PropertyKey, value: any) => {
      return adtProxyBuilder({
        value,
        onSet: () => {
          if (!isPropsPropertyKey(getType(storeThis)!, propertyKey)) {
            const info = storeAdmin?.propertyKeys.get(propertyKey);
            info?.reactSetState(info.getValue("Store"));
            storeAdmin?.renderConsumers(true);
          }
        },
      });
    };

    Object.keys(storeThis).forEach((propertyKey) => {
      storeAdmin?.propertyKeys.set(
        propertyKey,
        new StorePropertyKey(
          makeDeepObservable(propertyKey, storeThis[propertyKey])
        )
      );

      // Define setter and getter
      // to intercept this props getting and
      // return proxied value
      Object.defineProperty(storeThis, propertyKey, {
        enumerable: true,
        configurable: true,
        get() {
          const info = storeAdmin?.propertyKeys.get(propertyKey);
          const val = info?.getValue("Store");
          return val;
        },

        set(value: any) {
          const info = storeAdmin?.propertyKeys.get(propertyKey);
          if (info)
            info.setValue(makeDeepObservable(propertyKey, value), "Store");
          // Props property key must not affect renders status at all.
          if (!isPropsPropertyKey(getType(storeThis)!, propertyKey)) {
            info?.reactSetState(info.getValue("Store"));
          }
        },
      });
    });
  }

  /**
   * ********************************************************
   * ***************** Methods As Action ********************
   * ********************************************************
   */
  private static makeMethodsAsActions(storeThis: any) {
    const storeAdmin = getStoreAdministrator(storeThis);
    Object.entries(
      EnhancedStoreFactory.getMethodsPropertyDescriptors(storeThis)
    )
      .filter(([key]) => key !== "constructor")
      .filter(([, desc]) => desc.value) // only methods not getter or setter
      .forEach(([methodKey, descriptor]) => {
        storeAdmin?.methods.set(methodKey, null);

        const fn = function (this: any, ...args: any) {
          return getStoreAdministrator(this)?.runAction(() =>
            descriptor.value.apply(this, args)
          );
        };
        Reflect.set(fn, "name", methodKey);

        Object.defineProperty(storeThis, methodKey, {
          enumerable: false,
          configurable: true,
          get() {
            const storeAdmin = getStoreAdministrator(storeThis);
            const value = storeAdmin?.methods.get(methodKey);

            if (!value) {
              const boundFn = fn.bind(storeThis);
              storeAdmin?.methods.set(methodKey, boundFn);
              return boundFn;
            }
            // it first access value is undefined because proxied function
            // has to not been sed yet and only descriptor.value has fn ref.
            return value || fn.bind(storeThis);
          },
          set(value: any) {
            const storeAdmin = getStoreAdministrator(storeThis);
            storeAdmin?.methods.set(methodKey, value);
          },
        });
      });
  }

  private static getMethodsPropertyDescriptors(
    o: any
  ): Record<PropertyKey, PropertyDescriptor> {
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
  }
}
