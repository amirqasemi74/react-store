import { ORIGINAL_TARGET } from "src/constant";
import adtProxyBuilder, { BaseAdtProxyBuilderArgs } from ".";

interface ArrayProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  array: any[];
  depth: number;
}

const arrayProxyBuilder = ({
  array,
  depth,
  ...restOfArgs
}: ArrayProxyBuilderArgs): any[] => {
  const { getSetLogs, allowRender, store } = restOfArgs;
  return depth < 0
    ? array
    : new Proxy(array, {
        get(target: any, propertyKey: PropertyKey, receiver: any): any {
          // console.log("Array::get", target, propertyKey);
          const value = Reflect.get(target, propertyKey, receiver);
          getSetLogs?.push({
            type: "GET",
            target,
            propertyKey,
            value,
          });

          if (propertyKey === ORIGINAL_TARGET) {
            return target;
          }

          return Array.prototype[propertyKey]
            ? value
            : adtProxyBuilder({
                value,
                context: receiver,
                depth: depth - 1,
                ...restOfArgs,
              });
        },

        set(target: any, propertyKey: PropertyKey, value: any, receiver: any) {
          // console.log("Array::set", target, propertyKey, value);
          getSetLogs?.push({ type: "SET", target, propertyKey, value });
          const res = Reflect.set(target, propertyKey, value, receiver);
          if (allowRender) {
            store.renderConsumers();
          }
          return res;
        },
      });
};

export default arrayProxyBuilder;
