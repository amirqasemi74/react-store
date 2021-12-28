import type { StoreAdministrator } from "./storeAdministrator";

export class StoreMethodsManager {
  methods = new Map<PropertyKey, Function | null>();

  constructor(private storeAdmin: StoreAdministrator) {}

  makeAllAsActions() {
    Object.entries(this.getMethodsPropertyDescriptors(this.storeAdmin.instance))
      .filter(([key]) => key !== "constructor")
      .filter(([, desc]) => desc.value) // only methods not getter or setter
      .forEach(([methodKey, descriptor]) => {
        const self = this;
        this.methods.set(methodKey, null);

        const fn = function (this: any, ...args: any) {
          return self.storeAdmin.runAction(() => descriptor.value.apply(this, args));
        };
        Reflect.set(fn, "name", methodKey);

        Object.defineProperty(this.storeAdmin.instance, methodKey, {
          enumerable: false,
          configurable: true,
          get() {
            const value = self.methods.get(methodKey);

            if (!value) {
              const boundFn = fn.bind(self.storeAdmin.instance);
              self.methods.set(methodKey, boundFn);
              return boundFn;
            }
            // it first access value is undefined because proxied function
            // has to not been sed yet and only descriptor.value has fn ref.
            return value;
          },
          set(value: any) {
            self.methods.set(methodKey, value);
          },
        });
      });
  }

  private getMethodsPropertyDescriptors(
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
