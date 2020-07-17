import Store from "src/react/store";

export class AsyncFunctionProxyHandler<T extends (...args: any[]) => any>
  implements ProxyHandler<T> {
  constructor(
    private store: Store,
    private context: object,
    private methodKey: PropertyKey
  ) {}

  async apply(target: T, thisArg: any, argArray?: any) {
    return await Reflect.apply(target, this.context, argArray);
  }
}
