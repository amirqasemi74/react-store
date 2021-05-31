import { STORE_USED_CONTEXTES } from "../../constant";
import { useContext } from "react";
import { StoreAdministrator } from "../store/storeAdministrator";

export interface StoreUsedContext {
  propertyKey: PropertyKey;
  type: React.Context<any>;
  value?: any;
}

export const usedContextesHandler = (
  storeAdministrator: StoreAdministrator
) => {
  const storeUsedContextes: StoreUsedContext[] =
    storeAdministrator.type[STORE_USED_CONTEXTES] || [];

  storeAdministrator.turnOffRender();

  storeUsedContextes
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
