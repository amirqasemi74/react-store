import { STORE_USED_CONTEXTES } from "../constant";
import { useContext } from "react";
import Store from "../store";

export interface StoreUsedContext {
  propertyKey: PropertyKey;
  type: React.Context<any>;
  value?: any;
}

export const getUsedContextes = (storeType: Function) => {
  const storeUsedContextes: StoreUsedContext[] =
    storeType[STORE_USED_CONTEXTES] || [];

  return storeUsedContextes.map<StoreUsedContext>(storeUsedCtx => ({
    ...storeUsedCtx,
    value: useContext(storeUsedCtx.type)
  }));
};

export const setUsedContextesToInstance = (
  store: Store,
  contextes: StoreUsedContext[]
) => {
  store.turnOffRender();
  contextes.forEach(storeUsedCtx => {
    Reflect.set(store.instance, storeUsedCtx.propertyKey, storeUsedCtx.value);
  });
  store.turnOnRender();
};
