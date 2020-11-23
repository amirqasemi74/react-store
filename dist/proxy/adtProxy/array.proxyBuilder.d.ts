import { BaseAdtProxyBuilderArgs } from ".";
interface ArrayProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
    array: any[];
}
declare const arrayProxyBuilder: ({ array, ...restOfArgs }: ArrayProxyBuilderArgs) => any[];
export default arrayProxyBuilder;
