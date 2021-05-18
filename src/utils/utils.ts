import { STORE_ADMINISTRATION } from "src/constant";
import { StoreAdministrator } from "src/react/store/StoreAdministrator";

export const getType = (obj: object) => {
  const proto = Reflect.getPrototypeOf(obj);
  return proto && proto.constructor;
};

export const isStore = (target: object) => !!target[STORE_ADMINISTRATION];

export const getStoreAdministrator = (
  target: object
): StoreAdministrator | null =>
  (target[STORE_ADMINISTRATION] as StoreAdministrator) || null;
