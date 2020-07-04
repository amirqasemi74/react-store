import { GetSetStack } from "..";
import { STORE_REF } from "../../../constant";
import arrayProxyBuilder from "./arrayProxyBuilder";
import objectProxyBuilder from "./objectProxyBuilder";

interface AdtProxyBuilderArgs {
  value: any;
  getSetStack: Array<GetSetStack>;
}

const AdtProxyBuilder = ({ value, getSetStack }: AdtProxyBuilderArgs) => {
  const constructorName: BaseJsConstructorsName = value.constructor.name;

  switch (constructorName) {
    case "Array":
      return arrayProxyBuilder({ array: value, getSetStack });
    case "Object":
      return objectProxyBuilder({ object: value, getSetStack });
    case "Boolean":
    case "Number":
    case "RegExp":
    case "String":
      return value;
    default: {
      if (value instanceof Object && value[STORE_REF]) {
        return objectProxyBuilder({ object: value, getSetStack });
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
