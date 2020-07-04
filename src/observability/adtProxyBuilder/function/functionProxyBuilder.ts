import { AsyncFunctionProxyHandler } from "./asyncFunctionProxyHandler";
import { FunctionProxyHandler } from "./functionProxyHandler";
import Store from "src/react/store";
import { FunctionType } from "src/types";

interface FunctionProxyHandlerArgs {
  func: FunctionType;
  context: object;
  store: Store;
  methodKey: PropertyKey;
}

export const functionProxyBuilder = ({
  func,
  context,
  store,
  methodKey,
}: FunctionProxyHandlerArgs): FunctionType => {
  // let handler: ProxyHandler<FuncType> =
  //     getContainer().getStoreMetaData(store.getClassname()).isMethodAsync(methodKey, func)
  //         ? new AsyncFunctionProxyHandler(store, context, methodKey)
  //         : new FunctionProxyHandler(store, context, methodKey);

  return new Proxy<FunctionType>(
    func,
    new FunctionProxyHandler(store, context, methodKey)
  );
};
