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
  const proxiedArray = new Proxy<any[]>(
    array,
    new ArrayProxyHandler(store, storePropertyKey)
  );
  for (const arrElementIndex in array) {
    array[arrElementIndex] = adtProxyBuilder({
      store,
      propertyKey: storePropertyKey,
      value: array[arrElementIndex],
      depth: depth - 1,
      receiver: array,
    });
  }
  return proxiedArray;
};

export default arrayProxyBuilder;
