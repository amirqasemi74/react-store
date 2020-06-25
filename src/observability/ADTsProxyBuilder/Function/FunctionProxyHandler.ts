import Store from "src/react/store";

export class FunctionProxyHandler<T extends (...args: any[]) => any>
  implements ProxyHandler<T> {
  constructor(
    private store: Store,
    private context: object,
    private methodKey: PropertyKey
  ) {}

  public apply(target: T, thisArg: any, argArray?: any) {
    // this.store.addToMethodPropertyKeysCallStack({
    //   propertyKey: this.methodKey,
    //   isAsync: false,
    // });
    const result = Reflect.apply(target, this.context, argArray);

    // this.store.removeFromMethodPropertyKeysCallStack(this.methodKey);

    // // render if call stack is empty;
    // if (!this.store.isAnySyncMethodRunning()) {
    //   this.store.informStoreConsumers();
    // }
    return result;
  }
}
