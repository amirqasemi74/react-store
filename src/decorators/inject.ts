import { STORE_DEPENDENCIES } from "src/constant";

export default function (...args: any[]): ClassDecorator {
  return function (storeType: Function) {
    Reflect.set(storeType, STORE_DEPENDENCIES, args);
  };
}
