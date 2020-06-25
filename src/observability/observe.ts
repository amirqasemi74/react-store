import Store from "src/react/store";
import StoreProxyHandler from "./StoreProxyHandler";

export const observe = <T extends object>(target: T, store: Store): T => {
  return new Proxy(target, new StoreProxyHandler(store));
};
