import { STORE_ADMINISTRATION } from "src/constant";
import { StoreAdministration } from "src/react/store/storeAdministration";

export const getType = (obj: object) => {
  const proto = Reflect.getPrototypeOf(obj);
  return proto && proto.constructor;
};

export const isStore = (target: object) => !!target[STORE_ADMINISTRATION];

export const getStoreAdministration = (
  target: object
): StoreAdministration | null =>
  (target[STORE_ADMINISTRATION] as StoreAdministration) || null;
