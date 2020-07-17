import { STORE_USED_CONTEXTES } from "../constant";
import { useContext } from "react";
import Store from "../store";

export interface StoreUsedContext {
  propertyKey: PropertyKey;
  type: React.Context<any>;
  value?: any;
}

const usedContextesHandler = (store: Store) => {
  const storeUsedContextes: StoreUsedContext[] =
    store.constructorType[STORE_USED_CONTEXTES] || [];

  store.turnOffRender();

  storeUsedContextes
    .map<StoreUsedContext>((storeUsedCtx) => ({
      ...storeUsedCtx,
      value: useContext(storeUsedCtx.type),
    }))
    .forEach((storeUsedCtx) => {
      Reflect.set(store.instance, storeUsedCtx.propertyKey, storeUsedCtx.value);
    });
  store.turnOnRender();
};

export default usedContextesHandler;
