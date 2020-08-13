import Store from "src/react/store";
import adtProxyBuilder from "./adtProxyBuilder/adtProxyBuilder";
import { getFromContainer } from "src/container";
import ComponentDepsDetector from "src/react/setGetPathDetector/componentDepsDetector";

export default class StoreProxyHandler<T extends object>
  implements ProxyHandler<T> {
  constructor(private store: Store) {}

  get(target: T, propertyKey: PropertyKey, receiver: any) {
    // console.log(
    //   "Store::get",
    //   `${target.constructor.name}.${propertyKey.toString()}`
    // );
    const value = Reflect.get(target, propertyKey, receiver);

    getFromContainer(ComponentDepsDetector).pushGetSetInfo(
      "GET",
      target,
      propertyKey,
      value
    );

    return adtProxyBuilder({
      value,
      propertyKey,
      receiver,
      store: this.store,
    });
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
