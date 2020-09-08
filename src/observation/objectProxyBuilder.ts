import { GetSetLog } from "src/setGetPathDetector/dependencyExtractor";
import Store from "src/react/store";
import adtProxyBuilder from "./adtProxyBuilder";
import { ORIGINAL_TARGET } from "src/constant";

interface ObjectProxyBuilderArgs {
  store: Store;
  object: object;
  depth: number;
  getSetLogs?: GetSetLog[];
  allowRender?: boolean;
}

const objectProxyBuilder = ({
  store,
  object,
  depth,
  getSetLogs,
  allowRender,
}: ObjectProxyBuilderArgs): object => {
  return depth < 0
    ? object
    : new Proxy(object, {
        get(target: any, propertyKey: PropertyKey, receiver: any) {
          // console.log("Object::get", target, propertyKey);
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

          return Object.prototype[propertyKey]
            ? value
            : adtProxyBuilder({
                value,
                store,
                receiver,
                allowRender,
                depth,
                getSetLogs,
              });
        },

        set(target: any, propertyKey: PropertyKey, value: any, receiver: any) {
          // console.log("Objct::set", target, propertyKey, value);
          getSetLogs?.push({ type: "SET", target, propertyKey, value });
          const res = Reflect.set(target, propertyKey, value, receiver);
          allowRender && store.renderConsumers();
          return res;
        },
      });
};

export default objectProxyBuilder;
