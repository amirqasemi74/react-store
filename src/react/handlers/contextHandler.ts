import { STORE_USED_CONTEXTES } from "../../constant";
import { useContext } from "react";
import StoreAdministration from "../storeAdministration";

export interface StoreUsedContext {
  propertyKey: PropertyKey;
  type: React.Context<any>;
  value?: any;
}

const usedContextesHandler = (storeAdministration: StoreAdministration) => {
  const storeUsedContextes: StoreUsedContext[] =
    storeAdministration.constructorType[STORE_USED_CONTEXTES] || [];

  storeAdministration.turnOffRender();

  storeUsedContextes
    .map<StoreUsedContext>((storeUsedCtx) => ({
      ...storeUsedCtx,
      value: useContext(storeUsedCtx.type),
    }))
    .forEach((storeUsedCtx) => {
      Reflect.set(
        storeAdministration.instance,
        storeUsedCtx.propertyKey,
        storeUsedCtx.value
      );
    });
  storeAdministration.turnOnRender();
};

export default usedContextesHandler;
