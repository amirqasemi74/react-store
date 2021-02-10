import { isStorePart } from "src/decorators/storePart";
import { isStore } from "src/utils/utils";
import arrayProxyBuilder from "./array.proxyBuilder";
import functionProxyBuilder from "./function.proxyBuilder";
import objectProxyBuilder from "./object.proxyBuilder";

export interface BaseAdtProxyBuilderArgs {
  onSet?: () => void;
  proxyTypes?: Array<"Function" | "Array" | "Object">;
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
  const doObjectProxy = proxyTypes?.includes("Object") ?? true;
  const doArrayProxy = proxyTypes?.includes("Array") ?? true;
  const doFucntionProxy = proxyTypes?.includes("Function") ?? true;

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

    if (value instanceof Function && doFucntionProxy) {
      return functionProxyBuilder({
        func: value,
        context,
      });
    }
  } catch (error) {}
  return value;
};

export default adtProxyBuilder;
