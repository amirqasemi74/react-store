import adtProxyBuilder from "../adtProxyBuilder";
import ArrayProxyHandler from "./arrayProxyHandler";
import Store from "src/react/store";

interface ArrayProxyBuilderArgs {
  store: Store;
  storePropertyKey: PropertyKey;
  array: any[];
  depth: number;
}

const arrayProxyBuilder = ({
  store,
  storePropertyKey,
  array,
  depth,
}: ArrayProxyBuilderArgs): any[] => {
  if (depth < 0) {
    return array;
  }
  return new Proxy<any[]>(
    array,
    new ArrayProxyHandler(store, storePropertyKey)
  );
};

export default arrayProxyBuilder;
