import { GetSetStack } from "..";
import AdtProxyBuilder from "./adtProxyBuilder";

interface ArrayProxyBuilderArgs {
  array: any[];
  getSetStack: Array<GetSetStack>;
}

const arrayProxyBuilder = ({ array, getSetStack }: ArrayProxyBuilderArgs) => {
  return new Proxy<any[]>(array, {
    get(target: any, propertyKey: PropertyKey, receiver: any) {
      let value = Reflect.get(target, propertyKey, receiver);
      getSetStack.push({
        type: "GET",
        target,
        propertyKey,
        value,
      });
      // console.log("Array::get", propertyKey, value);
      return AdtProxyBuilder({
        value,
        getSetStack: getSetStack,
      });
    },

    set(target: any, propertyKey: PropertyKey, value: any, receiver: any) {
      // console.log("Array::set", target, propertyKey, value);
      getSetStack.push({ type: "SET", target, propertyKey, value });
      return Reflect.set(target, propertyKey, value, receiver);
    },
  });
};

export default arrayProxyBuilder;
