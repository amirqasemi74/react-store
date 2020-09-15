import { BaseAdtProxyBuilderArgs } from ".";
import proxyValueAndSaveIt from "../proxyValueAndSaveIt";

interface ObjectProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  object: object;
}

const objectProxyBuilder = ({
  object,
  ...restOfArgs
}: ObjectProxyBuilderArgs): object => {
  const { getSetLogs, onSet } = restOfArgs;

  return new Proxy(object, {
    get(target: any, propertyKey: PropertyKey, receiver: any) {
      // console.log("Object::get", target, propertyKey);
      const { pureValue, value } = proxyValueAndSaveIt(
        target,
        propertyKey,
        receiver,
        restOfArgs
      );

      getSetLogs?.push({
        type: "GET",
        target,
        propertyKey,
        value: pureValue,
      });

      return value;
    },

    set(target: any, propertyKey: PropertyKey, value: any, receiver: any) {
      // console.log("Objct::set", target, propertyKey, value);
      getSetLogs?.push({
        type: "SET",
        target,
        propertyKey,
        value,
      });

      const res = Reflect.set(target, propertyKey, value, receiver);
      onSet?.();
      return res;
    },
  });
};

export default objectProxyBuilder;
