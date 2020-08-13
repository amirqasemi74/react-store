import Store from "src/react/store";
import { getFromContainer } from "src/container";
import ComponentDepsDetector from "src/react/setGetPathDetector/componentDepsDetector";

export default class FunctionProxyHandler<T extends (...args: any[]) => any>
  implements ProxyHandler<T> {
  constructor(
    private store: Store,
    private context: object,
    private methodKey: PropertyKey
  ) {}

  apply(target: T, thisArg: any, argArray?: any) {
    getFromContainer(ComponentDepsDetector).resolveDeps();
    return Reflect.apply(target, this.context, argArray);
  }
}
