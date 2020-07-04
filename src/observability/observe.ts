import Store from "src/react/store";
import StoreProxyHandler from "./storeProxyHandler";

export const observe = <T extends object>(target: T, store: Store): T =>
  new Proxy(target, new StoreProxyHandler(store));
