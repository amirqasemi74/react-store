import Store from "src/react/store";
import adtProxyBuilder from "./adtProxyBuilder/adtProxyBuilder";

export default class StoreProxyHandler<T extends object>
  implements ProxyHandler<T> {
  constructor(private store: Store) {}

  get(target: T, propertyKey: PropertyKey, receiver: any) {
    // console.log(
    //   "Store::get",
    //   `${target.constructor.name}.${propertyKey.toString()}`
    // );

    const value = adtProxyBuilder({
      value: Reflect.get(target, propertyKey, receiver),
      propertyKey,
      receiver,
      store: this.store,
    });
    // Save proxied value to pure store object for next accessing to it's property
    // and not creating again a proxy object
    // Reflect.set(target, propertyKey, value);

    // Add to proxied value property keys for next checking
    // this.store.observeablePropertyKeys.add(propertyKey);

    //Effect Deps
    // this.store.addEffectDep(propertyKey,t)

    return value;
  }

  set(target: T, propertyKey: PropertyKey, value: any, receiver: any) {
    // Build Proxy from the value
    // let proxiedValue = AdtProxyBuilder({
    //   value,
    //   propertyKey,
    //   receiver,
    //   store: this.store,
    // });

    // if (this.store.isAnyMethodRunning) {
    //   // console.log("Store::set ->", propertyKey, "=", value);
    //   Reflect.set(target, propertyKey, proxiedValue, receiver);
    //   // this.store.enqueuePropertyKeyConsumersToBeInformed(propertyKey);
    // } else {
    //   console.error(
    //     "You can't change store state directly without calling any method"
    //   );
    // }
    const res = Reflect.set(target, propertyKey, value, receiver);

    this.store.renderConsumers();
    return res;
  }
}
