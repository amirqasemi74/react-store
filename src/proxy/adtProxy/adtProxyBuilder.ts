import arrayProxyBuilder from "./array.proxyBuilder";
import functionProxyBuilder from "./function.proxyBuilder";
import { mapProxyBuilder } from "./map.proxyBuilder";
import objectProxyBuilder from "./object.proxyBuilder";
import { ObservableMetadataUtils } from "src/decorators/observable";

export interface BaseAdtProxyBuilderArgs {
  onSet?: () => void;
  proxyTypes?: Array<"Function" | "Array" | "Object" | "Map">;
}

interface AdtProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  value: any;
  context?: any;
}

const adtProxyBuilder = ({ value, context, ...restOfArgs }: AdtProxyBuilderArgs) => {
  const valType = value?.constructor;
  const { proxyTypes } = restOfArgs;
  const doMapProxy = proxyTypes?.includes("Map") ?? true;
  const doArrayProxy = proxyTypes?.includes("Array") ?? true;
  const doObjectProxy = proxyTypes?.includes("Object") ?? true;
  const doFunctionProxy = proxyTypes?.includes("Function") ?? true;

  try {
    if (
      ((valType === Object && !Object.isFrozen(value)) ||
        (value instanceof Object && ObservableMetadataUtils.is(valType))) &&
      doObjectProxy
    ) {
      return objectProxyBuilder({
        object: value,
        ...restOfArgs,
      });
    }

    if (valType === Array && doArrayProxy) {
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
  } catch (error) {
    // Nothing to do
  }
  return value;
};

export default adtProxyBuilder;
