import { arrayProxyBuilder } from "./Array/ArrayProxyBuilder";
import { functionProxyBuilder } from "./Function/FunctionProxyBuilder";
import { objectProxyBuilder } from "./Object/ObjectProxyBuilder";
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

export const AdtProxyBuilder = ({
  value,
  propertyKey,
  receiver,
  store,
  depth,
}: AdtProxyBuilderArgs): any => {
  let proxiedValue = value;

  if (value) {
    switch (value.constructor) {
      // case Object:
      //   proxiedValue = objectProxyBuilder({
      //     store,
      //     storePropertyKey: propertyKey,
      //     object: value,
      //     depth: depth !== undefined ? depth : OBJECT_OBSERVABILITY_DEPTH,
      //   });
      //   break;

      case Array:
        proxiedValue = arrayProxyBuilder({
          store,
          storePropertyKey: propertyKey,
          array: value,
          depth: depth !== undefined ? depth : ARRAY_OBSERVABILITY_DEPTH,
        });
        break;

      case Function:
        proxiedValue = functionProxyBuilder({
          store,
          methodKey: propertyKey,
          func: value,
          context: receiver,
        });
        break;

      case Number:
      case String:
      case RegExp:
      case Boolean:
      default:
        proxiedValue = value;
    }
  }

  return proxiedValue;
};
