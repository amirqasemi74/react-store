import { isStore } from "src/utils/utils";
import { BaseAdtProxyBuilderArgs } from "./adtProxyBuilder";
import { proxyValueAndSaveIt } from "../proxyValueAndSaveIt";

interface ObjectProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  object: object;
}

const objectProxyBuilder = ({
  object,
  ...restOfArgs
}: ObjectProxyBuilderArgs): object => {
  const { onSet } = restOfArgs;

  return new Proxy(object, {
    get(target: any, propertyKey: PropertyKey, receiver: any) {
      // console.log("Object::get", target, propertyKey);
      return proxyValueAndSaveIt(target, propertyKey, receiver, restOfArgs);
    },

    set(target: any, propertyKey: PropertyKey, value: any, receiver: any) {
      // console.log("Objct::set", target, propertyKey, value);
      const res = Reflect.set(target, propertyKey, value, receiver);
      if (!isStore(target)) {
        onSet?.();
      }
      return res;
    },
  });
};

export default objectProxyBuilder;
