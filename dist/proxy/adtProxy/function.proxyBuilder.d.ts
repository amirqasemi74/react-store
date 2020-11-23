interface FunctionProxyHandlerArgs {
    func: Function;
    context: object;
}
declare const functionProxyBuilder: ({ func, context, }: FunctionProxyHandlerArgs) => Function;
export default functionProxyBuilder;
