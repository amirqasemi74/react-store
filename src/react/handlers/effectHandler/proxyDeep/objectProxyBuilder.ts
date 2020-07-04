import { GetSetStack } from "..";
import AdtProxyBuilder from "./adtProxyBuilder";

interface ObjectrPoxyBuilderArgs {
  object: object;
  getSetStack: Array<GetSetStack>;
}

const objectProxyBuilder = ({
  object,
  getSetStack,
}: ObjectrPoxyBuilderArgs) => {
  return new Proxy<object>(object, {
    get(target: any, propertyKey: PropertyKey, receiver: any) {
      let value = Reflect.get(target, propertyKey, receiver);

      // console.log("Object::get", propertyKey, value);
      getSetStack.push({ type: "GET", target, propertyKey, value });

      return AdtProxyBuilder({
        value,
        getSetStack: getSetStack,
      });
    },

    set(target: any, propertyKey: PropertyKey, value: any, receiver: any) {
      // console.log("Object::set", target, propertyKey, value);
      getSetStack.push({ type: "SET", target, propertyKey, value });
      return Reflect.set(target, propertyKey, value, receiver);
    },
  });
};

export default objectProxyBuilder;
