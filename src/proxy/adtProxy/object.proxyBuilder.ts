import adtProxyBuilder, { BaseAdtProxyBuilderArgs } from ".";

interface ObjectProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  object: object;
  depth: number;
}

const objectProxyBuilder = ({
  object,
  depth,
  ...restOfArgs
}: ObjectProxyBuilderArgs): object => {
  const { getSetLogs, allowRender, store } = restOfArgs;

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

          return Object.prototype[propertyKey]
            ? value
            : adtProxyBuilder({
                value,
                context: receiver,
                depth: depth - 1,
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
          if (allowRender) {
            store.renderConsumers();
          }
          return res;
        },
      });
};

export default objectProxyBuilder;
