import adtProxyBuilder, { BaseAdtProxyBuilderArgs } from ".";

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
      const value = Reflect.get(target, propertyKey, receiver);
      getSetLogs?.push({
        type: "GET",
        target,
        propertyKey,
        value,
      });

      return Array.prototype[propertyKey]
        ? value
        : adtProxyBuilder({
            value,
            context: receiver,
            ...restOfArgs,
          });
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
