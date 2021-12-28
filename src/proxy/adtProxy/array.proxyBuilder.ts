import { proxyValueAndSaveIt } from "../proxyValueAndSaveIt";
import { BaseAdtProxyBuilderArgs } from "./adtProxyBuilder";

interface ArrayProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  array: any[];
}

const arrayProxyBuilder = ({
  array,
  ...restOfArgs
}: ArrayProxyBuilderArgs): any[] => {
  const { onSet } = restOfArgs;
  return new Proxy(array, {
    get(target: any, propertyKey: PropertyKey, receiver: any): any {
      // console.log("Array::get", target, propertyKey);
      return proxyValueAndSaveIt(target, propertyKey, receiver, restOfArgs);
    },

    set(target: any, propertyKey: PropertyKey, value: any, receiver: any) {
      // console.log("Array::set", target, propertyKey, value);
      const res = Reflect.set(target, propertyKey, value, receiver);
      onSet?.();
      return res;
    },
  });
};

export default arrayProxyBuilder;
