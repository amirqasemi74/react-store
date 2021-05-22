import { isStore } from "src/utils/utils";
import adtProxyBuilder, { BaseAdtProxyBuilderArgs } from "./adtProxyBuilder";
import { PROXIED_VALUE, proxyValueAndSaveIt } from "../proxyValueAndSaveIt";

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
              [Object, Array, Map, Function].includes(value.constructor)
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
            if (!isStore(target)) {
              onSet?.();
            }
          };
        }

        case "delete": {
          return function (mapKey: any) {
            (value as Function).bind(target)(mapKey);
            if (!isStore(target)) {
              onSet?.();
            }
          };
        }

        case "clear": {
          return function () {
            (value as Function).bind(target)();
            if (!isStore(target)) {
              onSet?.();
            }
          };
        }
      }

      return Map.prototype[propertyKey] && value instanceof Function
        ? value.bind(map)
        : value;
    },
  });
};

class MapProxyHandler implements ProxyHandler<Map<unknown, unknown>> {}
