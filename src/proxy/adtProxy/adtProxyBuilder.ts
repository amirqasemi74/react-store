import { isStorePart } from "src/decorators/storePart";
import { isStore } from "src/utils/utils";
import arrayProxyBuilder from "./array.proxyBuilder";
import functionProxyBuilder from "./function.proxyBuilder";
import { mapProxyBuilder } from "./map.proxyBuilder";
import objectProxyBuilder from "./object.proxyBuilder";

export interface BaseAdtProxyBuilderArgs {
  onSet?: () => void;
  proxyTypes?: Array<"Function" | "Array" | "Object" | "Map">;
}

interface AdtProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  value: any;
  context?: any;
}
const adtProxyBuilder = ({
  value,
  context,
  ...restOfArgs
}: AdtProxyBuilderArgs) => {
  const { proxyTypes } = restOfArgs;
  const doMapProxy = proxyTypes?.includes("Map") ?? true;
  const doArrayProxy = proxyTypes?.includes("Array") ?? true;
  const doObjectProxy = proxyTypes?.includes("Object") ?? true;
  const doFunctionProxy = proxyTypes?.includes("Function") ?? true;

  try {
    if (
      (value.constructor === Object &&
        !Object.isFrozen(value) &&
        doObjectProxy) ||
      (value instanceof Object &&
        (isStore(value) || isStorePart(value.constructor)))
    ) {
      return objectProxyBuilder({
        object: value,
        ...restOfArgs,
      });
    }

    if (value.constructor === Array && doArrayProxy) {
      return arrayProxyBuilder({
        array: value,
        ...restOfArgs,
      });
    }

    if (value instanceof Function && doFunctionProxy) {
      return functionProxyBuilder({
        func: value,
        context,
      });
    }

    if (value instanceof Map && doMapProxy) {
      return mapProxyBuilder({
        map: value,
        ...restOfArgs,
      });
    }
  } catch (error) {}
  return value;
};

export default adtProxyBuilder;
