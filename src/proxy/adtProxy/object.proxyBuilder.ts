import { proxyValueAndSaveIt } from "../proxyValueAndSaveIt";
import { BaseAdtProxyBuilderArgs } from "./adtProxyBuilder";
import { TARGET } from "src/constant";

interface ObjectProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  object: object;
}

const objectProxyBuilder = ({
  object,
  ...restOfArgs
}: ObjectProxyBuilderArgs): object => {
  const { onSet } = restOfArgs;

  return new Proxy(object, {
    get(target: object, propertyKey: PropertyKey, receiver: unknown) {
      if (propertyKey === TARGET) {
        return target;
      }
      // console.log("Object::get", target, propertyKey);
      const value = proxyValueAndSaveIt(target, propertyKey, receiver, restOfArgs);
      restOfArgs.onAccess?.({
        value,
        target,
        type: "GET",
        propertyKey,
      });
      return value;
    },

    set(
      target: object,
      propertyKey: PropertyKey,
      value: unknown,
      receiver: unknown
    ) {
      // console.log("Object::set", target, propertyKey, value);
      restOfArgs.onAccess?.({
        target,
        value,
        type: "SET",
        propertyKey,
      });
      const res = Reflect.set(target, propertyKey, value, receiver);
      onSet?.();
      return res;
    },
  });
};

export default objectProxyBuilder;
