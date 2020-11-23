import { BaseAdtProxyBuilderArgs } from ".";
interface ObjectProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
    object: object;
}
declare const objectProxyBuilder: ({ object, ...restOfArgs }: ObjectProxyBuilderArgs) => object;
export default objectProxyBuilder;
