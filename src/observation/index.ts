import Store from "src/react/store";
import StoreProxyHandler from "./storeProxyHandler";

const observe = <T extends object>(target: T, store: Store): T =>
  new Proxy(target, new StoreProxyHandler(store));

export default observe;
