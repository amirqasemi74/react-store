import { BaseAdtProxyBuilderArgs, adtProxyBuilder } from "./adtProxyBuilder";
import { TARGET } from "src/constant";
import { Func } from "src/types";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";

interface MapProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  map: Map<unknown, unknown>;
}

export const mapProxyBuilder = ({
  map,
  ...restOfArgs
}: MapProxyBuilderArgs): object => {
  const { onSet } = restOfArgs;
  return new Proxy(map, {
    get(target: Map<unknown, unknown>, propertyKey: PropertyKey) {
      if (propertyKey === TARGET) {
        return target;
      }
      const value = target[propertyKey];
      switch (propertyKey) {
        case "get": {
          return function (mapKey: unknown) {
            return (value as Func).call(target, mapKey);
          };
        }

        case "set": {
          return function (mapKey: unknown, mapValue: unknown) {
            (value as Func).call(
              target,
              mapKey,
              adtProxyBuilder({
                onSet,
                value: getUnproxiedValue(mapValue, true),
                ...restOfArgs,
              })
            );
            onSet?.();
          };
        }

        case "delete": {
          return function (mapKey: unknown) {
            (value as Func).call(target, mapKey);
            onSet?.();
          };
        }

        case "clear": {
          return function () {
            (value as Func).call(target);
            onSet?.();
          };
        }
      }

      return value instanceof Function ? value.bind(map) : value;
    },
  });
};
