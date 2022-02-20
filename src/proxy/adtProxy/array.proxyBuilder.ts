import { PROXIED_VALUE, proxyValueAndSaveIt } from "../proxyValueAndSaveIt";
import { BaseAdtProxyBuilderArgs } from "./adtProxyBuilder";
import { TARGET } from "src/constant";

interface ArrayProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  array: unknown[];
}

const arrayProxyBuilder = ({
  array,
  ...restOfArgs
}: ArrayProxyBuilderArgs): unknown[] => {
  const { onSet } = restOfArgs;
  return new Proxy(array, {
    get(target: unknown[], propertyKey: PropertyKey, receiver: unknown) {
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

    set(
      target: unknown[],
      propertyKey: PropertyKey,
      value: unknown,
      receiver: unknown
    ) {
      // console.log("Array::set", target, propertyKey, value);
      restOfArgs.onAccess?.({
        target,
        value,
        type: "SET",
        propertyKey,
      });
      const res = Reflect.set(target, propertyKey, value, receiver);
      if (propertyKey !== PROXIED_VALUE) {
        onSet?.();
      }
      return res;
    },
  });
};

export default arrayProxyBuilder;
