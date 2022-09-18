import type { StoreAdministrator } from "../storeAdministrator";
import { MethodProxyHandler } from "./methodProxyHandler";
import { PROXY_HANDLER_TYPE, STORE_ADMINISTRATION } from "src/constant";
import { StoreForConsumerComponentProxy } from "src/proxy/storeForConsumerComponentProxy";
import { Func } from "src/types";

export class StoreMethodsManager {
  private methods = new Map<string, Func>();

  constructor(private storeAdmin: StoreAdministrator) {}

  bindMethods() {
    Object.entries(this.getMethodsPropertyDescriptors(this.storeAdmin.instance))
      .filter(([key]) => key !== "constructor")
      .filter(([, desc]) => desc.value) // only methods not getter or setter
      .forEach(([methodKey, descriptor]) => {
        const self = this; //eslint-disable-line

        this.methods.set(methodKey, function (this: unknown, ...args) {
          /**
           * if:
           * 1. function has no this
           * 2. or this === window
           * 3. or this is equal useStore context
           * 4.
           * we created own context for it
           */
          const context =
            !this ||
            (typeof this === "object" &&
              this[STORE_ADMINISTRATION] !== self.storeAdmin) ||
            (typeof this === "object" &&
              Reflect.get(this, PROXY_HANDLER_TYPE) ===
                StoreForConsumerComponentProxy)
              ? new Proxy(
                  self.storeAdmin.instance,
                  new MethodProxyHandler(self.storeAdmin)
                )
              : this;

          const res = (descriptor.value as Func)?.apply(context, args);
          return res;
        });

        Object.defineProperty(this.storeAdmin.instance, methodKey, {
          enumerable: false,
          configurable: true,
          get: () => this.methods.get(methodKey),
        });
      });
  }

  private getMethodsPropertyDescriptors(
    o: unknown
  ): Record<PropertyKey, PropertyDescriptor> {
    const _get = (o: unknown, methods = {}) => {
      const proto = Object.getPrototypeOf(o);
      if (proto && proto !== Object.prototype) {
        methods = { ...Object.getOwnPropertyDescriptors(proto), ...methods };
        return _get(proto, methods);
      } else {
        return methods;
      }
    };
    return _get(o);
  }
}
