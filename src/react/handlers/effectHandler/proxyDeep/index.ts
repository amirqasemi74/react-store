import { GetSetStack } from "../runEffect";
import AdtProxyBuilder from "./adtProxyBuilder";
import Store from "src/react/store";

interface ProxyDeepArgs {
  store: Store;
  getSetStack: Array<GetSetStack>;
}

const proxyDeep = ({ store, getSetStack }: ProxyDeepArgs) =>
  AdtProxyBuilder({ value: store.pureInstance, getSetStack, store });

export default proxyDeep;
