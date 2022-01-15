import arrayProxyBuilder from "./array.proxyBuilder";
import { mapProxyBuilder } from "./map.proxyBuilder";
import objectProxyBuilder from "./object.proxyBuilder";
import { ObservableMetadataUtils } from "src/decorators/observable";
import { AccessedProperty } from "src/react/store/administrator/propertyKeys/storePropertyKeysManager";

export interface BaseAdtProxyBuilderArgs {
  proxyTypes?: Array<"Array" | "Object" | "Map">;
  onSet?: () => void;
  onAccess?: (accessPath: AccessedProperty) => void;
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
