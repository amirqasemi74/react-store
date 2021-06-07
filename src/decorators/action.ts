import { getStoreAdministrator } from "src/utils/utils";

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
          return getStoreAdministrator(this)?.runAction(() =>
            fn.call(this, args)
          );
        };
      },
      set() {},
    };
  };
}
