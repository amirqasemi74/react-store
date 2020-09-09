import {
  ARRAY_OBSERVABILITY_DEPTH,
  OBJECT_OBSERVABILITY_DEPTH,
  STORE_REF,
} from "src/constant";
import Store from "src/react/store";
import { GetSetLog } from "src/setGetPathDetector/dependencyExtractor";
import arrayProxyBuilder from "./array.proxyBuilder";
import functionProxyBuilder from "./function.proxyBuilder";
import objectProxyBuilder from "./object.proxyBuilder";

export interface BaseAdtProxyBuilderArgs {
  store: Store;
  getSetLogs?: GetSetLog[];
  allowRender?: boolean;
  proxyTypes?: Array<"Function" | "Array" | "Object">;
}

interface AdtProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  value: any;
  depth?: number;
  context?: any;
  fixdeFuncContext?: any;
}
const adtProxyBuilder = ({
  value,
  depth,
  context,
  ...restOfArgs
}: AdtProxyBuilderArgs) => {
  const { proxyTypes, fixdeFuncContext } = restOfArgs;
  const proxyObject = proxyTypes?.includes("Object") ?? true;
  const proxyArray = proxyTypes?.includes("Array") ?? true;
  const proxyFunction = proxyTypes?.includes("Function") ?? true;

  try {
    switch (value.constructor) {
      case Object:
        // React props are frozen & mustn't be proxied
        return !Object.isFrozen(value) && proxyObject
          ? objectProxyBuilder({
              object: value,
              depth: depth !== undefined ? depth : OBJECT_OBSERVABILITY_DEPTH,
              ...restOfArgs,
            })
          : value;

      case Array:
        return proxyArray
          ? arrayProxyBuilder({
              array: value,
              depth: depth !== undefined ? depth : ARRAY_OBSERVABILITY_DEPTH,
              ...restOfArgs,
            })
          : value;

      case Function:
        return proxyFunction
          ? functionProxyBuilder({ func: value, context, fixdeFuncContext })
          : value;
      case Number:
      case String:
      case RegExp:
      case Boolean:
        return value;
      default:
        if (value instanceof Object && value[STORE_REF]) {
          return objectProxyBuilder({
            object: value,
            depth: depth !== undefined ? depth : OBJECT_OBSERVABILITY_DEPTH,
            ...restOfArgs,
          });
        }
        return value;
    }
  } catch (error) {
    return value;
  }
};

export default adtProxyBuilder;
