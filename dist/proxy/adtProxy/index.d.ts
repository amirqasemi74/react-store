import { GetSetLog } from "../../setGetPathDetector/dependencyExtractor";
export interface BaseAdtProxyBuilderArgs {
    onSet?: () => void;
    getSetLogs?: GetSetLog[];
    proxyTypes?: Array<"Function" | "Array" | "Object">;
    cacheProxied?: boolean;
}
interface AdtProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
    value: any;
    context?: any;
}
declare const adtProxyBuilder: ({ value, context, ...restOfArgs }: AdtProxyBuilderArgs) => any;
export default adtProxyBuilder;
