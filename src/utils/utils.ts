import { STORE_DEPENDENCIES, STORE_REF } from "src/constant";
import { ClassType } from "src/types";

export const getType = (obj: object) => {
  const proto = Reflect.getPrototypeOf(obj);
  return proto && proto.constructor;
};

export const getConstructorDepsType = (consructorType: Function): ClassType[] =>
  Reflect.getMetadata("design:paramtypes", consructorType) || [];

export const getStoreDependencies = (storeType: Function) =>
  (Reflect.get(storeType, STORE_DEPENDENCIES) as Function[]) || [];

export const isStore = (target: object) => !!target[STORE_REF];
