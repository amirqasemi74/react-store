import Store from "src/react/store";

export class ArrayProxyHandler<T extends any[]> implements ProxyHandler<T> {
  constructor(private store: Store, private storePropertyKey: PropertyKey) {}

  get(target: T, propertyKey: PropertyKey, receiver: any): any {
    // console.log("Array::get", target, propertyKey, this.storePropertyKey);
    return Reflect.get(target, propertyKey, receiver);
  }

  set(target: T, propertyKey: PropertyKey, value: any, receiver: any): boolean {
    // if (this.store.isAnyMethodRunning) {
    //   // console.log("Array::set", target, propertyKey, value, this.storePropertyKey);
    //   Reflect.set(target, propertyKey, value, receiver);
    //   this.store.enqueuePropertyKeyConsumersToBeInformed(this.storePropertyKey);
    // } else {
    //   console.error(
    //     "You can't change store state directly without calling any method"
    //   );
    // }
    // console.log(
    //   "Array::set",
    //   target,
    //   propertyKey,
    //   value,
    //   this.storePropertyKey
    // );
    this.store.renderConsumers();
    return Reflect.set(target, propertyKey, value, receiver);
  }
}
