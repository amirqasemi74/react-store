export const getType = (obj: object) => {
  const proto = Reflect.getPrototypeOf(obj);
  return proto && proto.constructor;
};
