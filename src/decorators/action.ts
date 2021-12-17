import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";

export function Action() {
  return function (
    target: any,
    propertyKey: PropertyKey,
    descriptor: PropertyDescriptor
  ) {
    const fn = descriptor.value as Function;
    return {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      get() {
        return (...args: any) => {
          return StoreAdministrator.get(this)?.runAction(() =>
            fn.call(this, args)
          );
        };
      },
      set() {},
    };
  };
}
