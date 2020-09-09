interface FunctionProxyHandlerArgs {
  func: Function;
  /**
   * In some case we want to proxy function with fixed context we pass
   * In normale case context for method is parent object of function
   */
  fixdeFuncContext?: any;
  context: object;
}

const functionProxyBuilder = ({
  func,
  context,
  fixdeFuncContext,
}: FunctionProxyHandlerArgs): Function => {
  return new Proxy(func, {
    apply(target: Function, thisArg: any, argArray?: any) {
      return Reflect.apply(target, fixdeFuncContext || context, argArray);
    },
  });
};

export default functionProxyBuilder;
