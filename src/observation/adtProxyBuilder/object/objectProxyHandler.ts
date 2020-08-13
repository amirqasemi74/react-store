import { getFromContainer } from "src/container";
import ComponentDepsDetector from "src/react/setGetPathDetector/componentDepsDetector";
import Store from "src/react/store";

export default class ObjectProxyHandler<T extends object>
  implements ProxyHandler<T> {
  constructor(private store: Store, private storePropertyKey: PropertyKey) {}

  get(target: T, propertyKey: PropertyKey, receiver: any): any {
    // console.log("Object::get", target, propertyKey);
    const value = Reflect.get(target, propertyKey, receiver);
    getFromContainer(ComponentDepsDetector).pushGetSetInfo(
      "GET",
      target,
      propertyKey,
      value
    );
    return value;
  }

  set(target: T, propertyKey: PropertyKey, value: any, receiver: any) {
    // console.log("Objct::set", target, propertyKey, value);
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
