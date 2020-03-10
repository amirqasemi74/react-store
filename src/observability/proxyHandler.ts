import { PROPS } from "src/react/constant";
import Store from "src/react/store";

export default class ProxyHandler<T extends object> implements ProxyHandler<T> {
  constructor(private store: Store) {}

  get(target: T, propertyKey: PropertyKey, receiver: any) {
    // console.log("get:", propertyKey, "->", target[propertyKey]);

    return target[propertyKey];
  }

  set(target: T, propertyKey: PropertyKey, value: any, receiver: any) {
    Reflect.set(target, propertyKey, value, receiver);
    // console.log("Set:", target, propertyKey, value);
    if (propertyKey !== PROPS) {
      this.store.consumers.forEach(cnsr => cnsr.forceUpdate());
    }

    return true;
  }
}
