import Store from "src/react/store";

export class AsyncFunctionProxyHandler<T extends (...args: any[]) => any>
  implements ProxyHandler<T> {
  constructor(
    private store: Store,
    private context: object,
    private methodKey: PropertyKey
  ) {}

  public async apply(target: T, thisArg: any, argArray?: any) {
    const { store } = this;
    // store.addToMethodPropertyKeysCallStack({propertyKey: this.methodKey, isAsync: true});

    const result = await Reflect.apply(target, this.context, argArray);

    // store.removeFromMethodPropertyKeysCallStack(this.methodKey);
    // store.informConsumersIfhasAnyPendingInformRequest();
    return result;
  }
}
