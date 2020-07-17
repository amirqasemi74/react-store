import Store from "src/react/store";

export class FunctionProxyHandler<T extends (...args: any[]) => any>
  implements ProxyHandler<T> {
  constructor(
    private store: Store,
    private context: object,
    private methodKey: PropertyKey
  ) {}

  apply(target: T, thisArg: any, argArray?: any) {
    return Reflect.apply(target, this.context, argArray);
  }
}
