interface FunctionProxyHandlerArgs {
  func: Function;
  context: object;
}

const functionProxyBuilder = ({
  func,
  context,
}: FunctionProxyHandlerArgs): Function => {
  return new Proxy(func, {
    apply(target: Function, thisArg: any, argArray?: any) {
      return Reflect.apply(target, context, argArray);
    },
  });
};

export default functionProxyBuilder;
