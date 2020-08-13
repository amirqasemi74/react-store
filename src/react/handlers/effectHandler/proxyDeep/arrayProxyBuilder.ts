import Store from "src/react/store";
import AdtProxyBuilder from "./adtProxyBuilder";
import dependencyExtarctor, { GetSetLog } from "src/react/setGetPathDetector/dependencyExtractor";

interface ArrayProxyBuilderArgs {
  array: any[];
  getSetLogs: Array<GetSetLog>;
  store: Store;
}

const arrayProxyBuilder = ({
  array,
  getSetLogs,
  store,
}: ArrayProxyBuilderArgs) => {
  return new Proxy<any[]>(array, {
    get(target: any, propertyKey: PropertyKey, receiver: any) {
      let value = Reflect.get(target, propertyKey, receiver);
      getSetLogs.push({
        type: "GET",
        target,
        propertyKey,
        value,
      });
      // console.log("Array::get", propertyKey, value);
      return AdtProxyBuilder({
        value,
        store,
        getSetLogs,
      });
    },

    set(target: any, propertyKey: PropertyKey, value: any, receiver: any) {
      // console.log("Array::set", target, propertyKey, value);
      getSetLogs.push({ type: "SET", target, propertyKey, value });
      const res = Reflect.set(target, propertyKey, value, receiver);
      store.renderConsumers(dependencyExtarctor(getSetLogs, store, "SET"));
      return res;
    },
  });
};

export default arrayProxyBuilder;
