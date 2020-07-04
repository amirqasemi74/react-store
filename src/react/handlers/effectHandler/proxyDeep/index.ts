import { GetSetStack } from "..";
import AdtProxyBuilder from "./adtProxyBuilder";

interface ProxyDeepArgs<T> {
  target: T;
  getSetStack: Array<GetSetStack>;
}

const proxyDeep = <T>({ target, getSetStack }: ProxyDeepArgs<T>): T =>
  AdtProxyBuilder({ value: target, getSetStack });

export default proxyDeep;
