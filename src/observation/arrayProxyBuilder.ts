import { GetSetLog } from "src/setGetPathDetector/dependencyExtractor";
import Store from "src/react/store";
import adtProxyBuilder from "./adtProxyBuilder";

interface ArrayProxyBuilderArgs {
  store: Store;
  array: any[];
  depth: number;
  getSetLogs?: GetSetLog[];
  allowRender?: boolean;
}

const arrayProxyBuilder = ({
  store,
  array,
  depth,
  getSetLogs,
  allowRender,
}: ArrayProxyBuilderArgs): any[] =>
  depth < 0
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
          return Array.prototype[propertyKey]
            ? value
            : adtProxyBuilder({
                store,
                value,
                receiver,
                getSetLogs,
                allowRender,
                depth,
              });
        },

        set(target: any, propertyKey: PropertyKey, value: any, receiver: any) {
          // console.log("Array::set", target, propertyKey, value);
          getSetLogs?.push({ type: "SET", target, propertyKey, value });
          const res = Reflect.set(target, propertyKey, value, receiver);
          allowRender && store.renderConsumers();
          return res;
        },
      });

export default arrayProxyBuilder;
