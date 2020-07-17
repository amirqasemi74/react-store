import { ClassType } from "src/types";

export const getType = (obj: object) => {
  const proto = Reflect.getPrototypeOf(obj);
  return proto && proto.constructor;
};

export const getDepsConstructorType = (consructorType: Function): ClassType[] =>
  Reflect.getMetadata("design:paramtypes", consructorType) || [];
