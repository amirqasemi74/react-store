import AdtProxyBuilder from "./adtProxyBuilder";
import Store from "src/react/store";
import { GetSetLog } from "src/react/setGetPathDetector/dependencyExtractor";

interface ProxyDeepArgs {
  store: Store;
  getSetLogs: GetSetLog[];
}

const proxyDeep = ({ store, getSetLogs }: ProxyDeepArgs) =>
  AdtProxyBuilder({ value: store.pureInstance, getSetLogs, store });

export default proxyDeep;
