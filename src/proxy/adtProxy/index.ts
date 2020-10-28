import { isService } from "src/decorators/service";
import { GetSetLog } from "src/setGetPathDetector/dependencyExtractor";
import { isStore } from "src/utils/utils";
import arrayProxyBuilder from "./array.proxyBuilder";
import functionProxyBuilder from "./function.proxyBuilder";
import objectProxyBuilder from "./object.proxyBuilder";

export interface BaseAdtProxyBuilderArgs {
  onSet?: () => void;
  getSetLogs?: GetSetLog[];
  proxyTypes?: Array<"Function" | "Array" | "Object">;
  cacheProxied?: boolean;
}

interface AdtProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  value: any;
  context?: any;
  fixdeFuncContext?: any;
}
const adtProxyBuilder = ({
  value,
  context,
  ...restOfArgs
}: AdtProxyBuilderArgs) => {
  restOfArgs = {
    ...restOfArgs,
    cacheProxied: restOfArgs.cacheProxied ?? true,
  };
  const { proxyTypes, fixdeFuncContext } = restOfArgs;
  const proxyObject = proxyTypes?.includes("Object") ?? true;
  const proxyArray = proxyTypes?.includes("Array") ?? true;
  const proxyFunction = proxyTypes?.includes("Function") ?? true;

  try {
    if (
      (value.constructor === Object &&
        !Object.isFrozen(value) &&
        proxyObject) ||
      (value instanceof Object &&
        (isStore(value) || isService(value.constructor)))
    ) {
      return objectProxyBuilder({
        object: value,
        ...restOfArgs,
      });
    }

    if (value.constructor === Array && proxyArray) {
      return arrayProxyBuilder({
        array: value,
        ...restOfArgs,
      });
    }

    if (value instanceof Function && proxyFunction) {
      return functionProxyBuilder({
        func: value,
        context,
        fixdeFuncContext,
      });
    }
  } catch (error) {}
  return value;
};

export default adtProxyBuilder;
