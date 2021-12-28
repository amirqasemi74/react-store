import { PROXIED_VALUE } from "../proxyValueAndSaveIt";
import adtProxyBuilder, { BaseAdtProxyBuilderArgs } from "./adtProxyBuilder";

interface MapProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  map: Map<any, any>;
}

export const mapProxyBuilder = ({
  map,
  ...restOfArgs
}: MapProxyBuilderArgs): object => {
  const { onSet } = restOfArgs;

  return new Proxy(map, {
    get(target: any, propertyKey: PropertyKey) {
      const value = target[propertyKey];

      switch (propertyKey) {
        case "get": {
          return function (mapKey: any) {
            const _val = (value as Function).bind(target)(mapKey);

            if (
              _val &&
              !Object.isFrozen(_val) &&
              ([Object, Array, Map].includes(_val.constructor) ||
                _val instanceof Function)
            ) {
              return (
                _val[PROXIED_VALUE] ||
                (_val[PROXIED_VALUE] = adtProxyBuilder({
                  onSet,
                  value: _val,
                  context: _val,
                }))
              );
            }
            return _val;
          };
        }

        case "set": {
          return function (mapKey: any, mapValue: any) {
            (value as Function).bind(target)(mapKey, mapValue);
            onSet?.();
          };
        }

        case "delete": {
          return function (mapKey: any) {
            (value as Function).bind(target)(mapKey);
            onSet?.();
          };
        }

        case "clear": {
          return function () {
            (value as Function).bind(target)();
            onSet?.();
          };
        }
      }

      return Map.prototype[propertyKey] && value instanceof Function
        ? value.bind(map)
        : value;
    },
  });
};
