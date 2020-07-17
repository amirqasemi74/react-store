import Store from "src/react/store";
import { FunctionProxyHandler } from "./functionProxyHandler";

interface FunctionProxyHandlerArgs {
  func: Function;
  context: object;
  store: Store;
  methodKey: PropertyKey;
}

export const functionProxyBuilder = ({
  func,
  context,
  store,
  methodKey,
}: FunctionProxyHandlerArgs): Function => {
  return new Proxy<Function>(
    func,
    new FunctionProxyHandler(store, context, methodKey)
  );
};
