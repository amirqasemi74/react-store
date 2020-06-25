import { AdtProxyBuilder } from "./ADTsProxyBuilder/AdtProxyBuilder";
import Store from "src/react/store";

export default class StoreProxyHandler<T extends object>
  implements ProxyHandler<T> {
  constructor(private store: Store) {}

  get(target: T, propertyKey: PropertyKey, receiver: any) {
    // console.log("Store::get", propertyKey);
    let value = Reflect.get(target, propertyKey, receiver);

    if (!this.store.observeablePropertyKeys.has(propertyKey)) {
      value = AdtProxyBuilder({
        value,
        propertyKey,
        receiver,
        store: this.store,
      });
      // Save proxied value to pure store object for next accessing to it's property
      // and not creating again a proxy object
      Reflect.set(target, propertyKey, value);

      // Add to proxied value property keys for next checking
      this.store.observeablePropertyKeys.add(propertyKey);
    }

    return value;
  }

  set(target: T, propertyKey: PropertyKey, value: any, receiver: any) {
    // Build Proxy from the value
    let proxiedValue = AdtProxyBuilder({
      value,
      propertyKey,
      receiver,
      store: this.store,
    });

    // if (this.store.isAnyMethodRunning) {
    //   // console.log("Store::set ->", propertyKey, "=", value);
    //   Reflect.set(target, propertyKey, proxiedValue, receiver);
    //   // this.store.enqueuePropertyKeyConsumersToBeInformed(propertyKey);
    // } else {
    //   console.error(
    //     "You can't change store state directly without calling any method"
    //   );
    // }
    Reflect.set(target, propertyKey, proxiedValue, receiver);

    if (this.store.isRenderAllow) {
      this.store.consumers.forEach((cnsr) => cnsr.render());
    }
    return true;
  }
}
