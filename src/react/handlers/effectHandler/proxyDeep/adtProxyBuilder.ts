import Store from "src/react/store";
import { STORE_REF } from "../../../constant";
import { GetSetStack } from "../runEffect";
import arrayProxyBuilder from "./arrayProxyBuilder";
import objectProxyBuilder from "./objectProxyBuilder";

interface AdtProxyBuilderArgs {
  value: any;
  getSetStack: Array<GetSetStack>;
  store: Store;
}

const AdtProxyBuilder = ({
  value,
  getSetStack,
  store,
}: AdtProxyBuilderArgs) => {
  const constructorName: BaseJsConstructorsName = value.constructor.name;

  switch (constructorName) {
    case "Array":
      return arrayProxyBuilder({ array: value, getSetStack, store });
    case "Object":
      return objectProxyBuilder({ object: value, getSetStack, store });
    case "Boolean":
    case "Number":
    case "RegExp":
    case "String":
      return value;
    default: {
      if (value instanceof Object && value[STORE_REF]) {
        return objectProxyBuilder({ object: value, getSetStack, store });
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
