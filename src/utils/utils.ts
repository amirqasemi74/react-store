import { STORE_REF } from "src/constant";
import { CONSTRUCTOR_DEPENDENCY_TYPES } from "src/decorators/inject";

export const getType = (obj: object) => {
  const proto = Reflect.getPrototypeOf(obj);
  return proto && proto.constructor;
};


export const isStore = (target: object) => !!target[STORE_REF];
