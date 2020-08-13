import dependencyExtarctor, {
  GetSetLog,
} from "src/react/setGetPathDetector/dependencyExtractor";
import Store from "src/react/store";
import AdtProxyBuilder from "./adtProxyBuilder";

interface ObjectrPoxyBuilderArgs {
  object: object;
  getSetLogs: Array<GetSetLog>;
  store: Store;
}

const objectProxyBuilder = ({
  object,
  getSetLogs,
  store,
}: ObjectrPoxyBuilderArgs) => {
  return new Proxy<object>(object, {
    get(target: any, propertyKey: PropertyKey, receiver: any) {
      let value = Reflect.get(target, propertyKey, receiver);

      // console.log("Object::get", propertyKey, value);
      getSetLogs.push({ type: "GET", target, propertyKey, value });

      return AdtProxyBuilder({
        value,
        store,
        getSetLogs,
      });
    },

    set(target: any, propertyKey: PropertyKey, value: any, receiver: any) {
      // console.log("Object::set", target, propertyKey, value);
      getSetLogs.push({ type: "SET", target, propertyKey, value });
      const res = Reflect.set(target, propertyKey, value, receiver);
      store.renderConsumers(dependencyExtarctor(getSetLogs, store, "SET"));
      return res;
    },
  });
};

export default objectProxyBuilder;
