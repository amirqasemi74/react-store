import Store from "src/react/store";

export class ObjectProxyHandler<T extends object> implements ProxyHandler<T> {
  constructor(private store: Store, private storePropertyKey: PropertyKey) {}

  public get(target: T, propertyKey: PropertyKey, receiver: any): any {
    // console.log("Object::get" , target, propertyKey, this.storePropertyKey);
    return Reflect.get(target, propertyKey, receiver);
  }

  public set(
    target: T,
    propertyKey: PropertyKey,
    value: any,
    receiver: any
  ): boolean {
    // if (this.store.isAnyMethodRunning) {
    //   // console.log("Objct::set", target, propertyKey, value);
    //   Reflect.set(target, propertyKey, value, receiver);
    //   // this.store.enqueuePropertyKeyConsumersToBeInformed(this.storePropertyKey);
    // } else {
    //   console.error(
    //     "You can't change store state directly without calling any method"
    //   );
    // }
    return true;
  }
}
