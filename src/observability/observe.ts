import Store from "src/react/store";
import ProxyHandler from "./proxyHandler";

export const observe = <T extends object>(target: T, store: Store): T => {
  return new Proxy(target, new ProxyHandler(store));
};
