import { STORE_USED_CONTEXTS } from "../../constant";
import { useContext } from "react";
import { StoreAdministrator } from "../store/storeAdministrator";

export interface StoreUsedContext {
  propertyKey: PropertyKey;
  type: React.Context<any>;
  value?: any;
}

export const usedContextsHandler = (
  storeAdministrator: StoreAdministrator
) => {
  const storeUsedContexts: StoreUsedContext[] =
    storeAdministrator.type[STORE_USED_CONTEXTS] || [];

  storeAdministrator.turnOffRender();

  storeUsedContexts
    .map<StoreUsedContext>((storeUsedCtx) => ({
      ...storeUsedCtx,
      value: useContext(storeUsedCtx.type),
    }))
    .forEach((storeUsedCtx) => {
      Reflect.set(
        storeAdministrator.instance,
        storeUsedCtx.propertyKey,
        storeUsedCtx.value
      );
    });
  storeAdministrator.turnOnRender();
};
