import adtProxyBuilder, { BaseAdtProxyBuilderArgs } from ".";

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
      const value = Reflect.get(target, propertyKey, receiver);

      getSetLogs?.push({
        type: "GET",
        target,
        propertyKey,
        value,
      });

      return Object.prototype[propertyKey]
        ? value
        : adtProxyBuilder({
            value,
            context: receiver,
            ...restOfArgs,
          });
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
