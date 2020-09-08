import {
  ARRAY_OBSERVABILITY_DEPTH,
  OBJECT_OBSERVABILITY_DEPTH,
  STORE_REF,
} from "src/react/constant";
import { GetSetLog } from "src/setGetPathDetector/dependencyExtractor";
import Store from "src/react/store";
import arrayProxyBuilder from "./arrayProxyBuilder";
import functionProxyBuilder from "./functionProxyBuilder";
import objectProxyBuilder from "./objectProxyBuilder";

interface AdtProxyBuilderArgs {
  value: any;
  depth?: number;
  receiver?: any;
  store: Store;
  getSetLogs?: GetSetLog[];
  allowRender?: boolean;
}
const adtProxyBuilder = ({
  value,
  store,
  depth,
  receiver,
  getSetLogs,
  allowRender = false,
}: AdtProxyBuilderArgs) => {
  try {
    switch (value.constructor) {
      case Object:
        // React props are frozen & mustn't be proxied
        return !Object.isFrozen(value)
          ? objectProxyBuilder({
              store,
              object: value,
              depth: depth !== undefined ? depth : OBJECT_OBSERVABILITY_DEPTH,
              getSetLogs,
              allowRender,
            })
          : value;

      case Array:
        return arrayProxyBuilder({
          store,
          array: value,
          depth: depth !== undefined ? depth : ARRAY_OBSERVABILITY_DEPTH,
          getSetLogs,
          allowRender,
        });

      case Function:
        return functionProxyBuilder({ func: value, context: receiver });
      case Number:
      case String:
      case RegExp:
      case Boolean:
        return value;
      default:
        if (value instanceof Object && value[STORE_REF]) {
          return objectProxyBuilder({
            object: value,
            store,
            depth: depth !== undefined ? depth : OBJECT_OBSERVABILITY_DEPTH,
            getSetLogs,
            allowRender,
          });
        }
        return value;
    }
  } catch (error) {
    return value;
  }
};

export default adtProxyBuilder;
