import { BaseAdtProxyBuilderArgs } from ".";
import proxyValueAndSaveIt from "../proxyValueAndSaveIt";

interface ArrayProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  array: any[];
}

const arrayProxyBuilder = ({
  array,
  ...restOfArgs
}: ArrayProxyBuilderArgs): any[] => {
  const { getSetLogs, onSet } = restOfArgs;
  return new Proxy(array, {
    get(target: any, propertyKey: PropertyKey, receiver: any): any {
      // console.log("Array::get", target, propertyKey);
      const { pureValue, value } = proxyValueAndSaveIt(
        target,
        propertyKey,
        receiver,
        restOfArgs
      );

      getSetLogs?.push({
        type: "GET",
        target,
        propertyKey,
        value: pureValue,
      });

      return value;
    },

    set(target: any, propertyKey: PropertyKey, value: any, receiver: any) {
      // console.log("Array::set", target, propertyKey, value);
      getSetLogs?.push({ type: "SET", target, propertyKey, value });
      const res = Reflect.set(target, propertyKey, value, receiver);
      onSet?.();
      return res;
    },
  });
};

export default arrayProxyBuilder;
