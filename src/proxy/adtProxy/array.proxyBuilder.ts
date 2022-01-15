import { proxyValueAndSaveIt } from "../proxyValueAndSaveIt";
import { BaseAdtProxyBuilderArgs } from "./adtProxyBuilder";
import { TARGET } from "src/constant";

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
      if (propertyKey === TARGET) {
        return target;
      }
      // console.log(
      //   "Array::get",
      //   target,
      //   propertyKey,
      //   Array.prototype.hasOwnProperty(propertyKey)
      // );
      const value = proxyValueAndSaveIt(target, propertyKey, receiver, restOfArgs);
      restOfArgs.onAccess?.({
        value,
        target,
        type: "GET",
        propertyKey,
      });
      return value;
    },

    set(target: any, propertyKey: PropertyKey, value: any, receiver: any) {
      // console.log("Array::set", target, propertyKey, value);
      restOfArgs.onAccess?.({
        target,
        value,
        type: "SET",
        propertyKey,
      });
      const res = Reflect.set(target, propertyKey, value, receiver);
      onSet?.();
      return res;
    },
  });
};

export default arrayProxyBuilder;
