import Store from "src/react/store";
import { GetSetStack } from "..";
import AdtProxyBuilder from "./adtProxyBuilder";

interface ObjectrPoxyBuilderArgs {
  object: object;
  getSetStack: Array<GetSetStack>;
  store: Store;
}

const objectProxyBuilder = ({
  object,
  getSetStack,
  store,
}: ObjectrPoxyBuilderArgs) => {
  return new Proxy<object>(object, {
    get(target: any, propertyKey: PropertyKey, receiver: any) {
      let value = Reflect.get(target, propertyKey, receiver);

      // console.log("Object::get", propertyKey, value);
      getSetStack.push({ type: "GET", target, propertyKey, value });

      return AdtProxyBuilder({
        value,
        store,
        getSetStack: getSetStack,
      });
    },

    set(target: any, propertyKey: PropertyKey, value: any, receiver: any) {
      // console.log("Object::set", target, propertyKey, value);
      getSetStack.push({ type: "SET", target, propertyKey, value });
      const res = Reflect.set(target, propertyKey, value, receiver);
      store.renderConsumers();
      return res;
    },
  });
};

export default objectProxyBuilder;
