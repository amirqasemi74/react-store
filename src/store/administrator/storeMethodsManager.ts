import type { StoreAdministrator } from "./storeAdministrator";
import { Func } from "src/types";

export class StoreMethodsManager {
  methods = new Map<PropertyKey, { storeBound: Func | null }>();

  constructor(private storeAdmin: StoreAdministrator) {}

  bindMethods() {
    Object.entries(this.getMethodsPropertyDescriptors(this.storeAdmin.instance))
      .filter(([key]) => key !== "constructor")
      .filter(([, desc]) => desc.value) // only methods not getter or setter
      .forEach(([methodKey, descriptor]) => {
        this.methods.set(methodKey, {
          storeBound: descriptor.value?.bind(this.storeAdmin.instance),
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
