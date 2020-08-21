import arrayProxyBuilder from "./array/arrayProxyBuilder";
import functionProxyBuilder from "./function/functionProxyBuilder";
import objectProxyBuilder from "./object/objectProxyBuilder";
import Store from "src/react/store";
import {
  OBJECT_OBSERVABILITY_DEPTH,
  ARRAY_OBSERVABILITY_DEPTH,
} from "src/react/constant";

interface AdtProxyBuilderArgs {
  value: any;
  propertyKey: PropertyKey;
  receiver: any;
  depth?: number;
  store: Store;
}
const adtProxyBuilder = ({
  value,
  propertyKey,
  receiver,
  store,
  depth,
}: AdtProxyBuilderArgs) => {
  try {
    switch (value.constructor) {
      case Object:
        // React props are frozen & mustn't be proxied
        return !Object.isFrozen(value)
          ? objectProxyBuilder({
              store,
              storePropertyKey: propertyKey,
              object: value,
              depth: depth !== undefined ? depth : OBJECT_OBSERVABILITY_DEPTH,
            })
          : value;

      case Array:
        return arrayProxyBuilder({
          store,
          storePropertyKey: propertyKey,
          array: value,
          depth: depth !== undefined ? depth : ARRAY_OBSERVABILITY_DEPTH,
        });

      case Function:
        return functionProxyBuilder({
          store,
          methodKey: propertyKey,
          func: value,
          context: receiver,
        });

      case Number:
      case String:
      case RegExp:
      case Boolean:
      default:
        return value;
    }
  } catch (error) {
    return value;
  }
};

export default adtProxyBuilder;
