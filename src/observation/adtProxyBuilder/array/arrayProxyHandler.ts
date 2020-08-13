import Store from "src/react/store";
import { getFromContainer } from "src/container";
import ComponentDepsDetector from "src/react/setGetPathDetector/componentDepsDetector";

export default class ArrayProxyHandler<T extends any[]>
  implements ProxyHandler<T> {
  constructor(private store: Store, private storePropertyKey: PropertyKey) {}

  get(target: T, propertyKey: PropertyKey, receiver: any): any {
    // console.log("Array::get", target, propertyKey);
    const value = Reflect.get(target, propertyKey, receiver);
    getFromContainer(ComponentDepsDetector).pushGetSetInfo(
      "GET",
      target,
      propertyKey,
      value
    );
    return value;
  }

  set(target: T, propertyKey: PropertyKey, value: any, receiver: any): boolean {
    // console.log("Array::set", target, propertyKey, value);
    getFromContainer(ComponentDepsDetector).pushGetSetInfo(
      "SET",
      target,
      propertyKey,
      value
    );
    const res = Reflect.set(target, propertyKey, value, receiver);
    this.store.renderConsumers(
      getFromContainer(ComponentDepsDetector).extarctSetPaths(this.store)
    );
    return res;
  }
}
