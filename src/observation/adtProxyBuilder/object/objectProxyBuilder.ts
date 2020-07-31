import adtProxyBuilder from "../adtProxyBuilder";
import ObjectProxyHandler from "./objectProxyHandler";
import Store from "src/react/store";

interface ObjectProxyBuilderArgs {
  store: Store;
  storePropertyKey: PropertyKey;
  object: object;
  depth: number;
}

const objectProxyBuilder = ({
  store,
  storePropertyKey,
  object,
  depth,
}: ObjectProxyBuilderArgs): object => {
  if (depth < 0) {
    return object;
  }
  const proxiedObject = new Proxy<object>(
    object,
    new ObjectProxyHandler(store, storePropertyKey)
  );
  for (const key in object) {
    object[key] = adtProxyBuilder({
      store,
      propertyKey: storePropertyKey,
      value: object[key],
      depth: depth - 1,
      receiver: object,
    });
  }
  return proxiedObject;
};

export default objectProxyBuilder;
