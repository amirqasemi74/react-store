import Store from "src/react/store";
import { STORE_REF } from "../../../constant";
import arrayProxyBuilder from "./arrayProxyBuilder";
import objectProxyBuilder from "./objectProxyBuilder";
import { GetSetLog } from "src/react/setGetPathDetector/dependencyExtractor";

interface AdtProxyBuilderArgs {
  value: any;
  getSetLogs: Array<GetSetLog>;
  store: Store;
}

const AdtProxyBuilder = ({
  value,
  getSetLogs,
  store,
}: AdtProxyBuilderArgs) => {
  const constructorName: BaseJsConstructorsName = value.constructor.name;

  switch (constructorName) {
    case "Array":
      return arrayProxyBuilder({ array: value, getSetLogs, store });
    case "Object":
      return objectProxyBuilder({ object: value, getSetLogs, store });
    case "Boolean":
    case "Number":
    case "RegExp":
    case "String":
      return value;
    default: {
      if (value instanceof Object && value[STORE_REF]) {
        return objectProxyBuilder({ object: value, getSetLogs, store });
      }
      return value;
    }
  }
};

type BaseJsConstructorsName =
  | "Array"
  | "Object"
  | "Function"
  | "String"
  | "Number"
  | "RegExp"
  | "Boolean";

export default AdtProxyBuilder;
