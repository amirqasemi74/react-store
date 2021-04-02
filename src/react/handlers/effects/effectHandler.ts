import { getEffectsMetaData } from "src/decorators/effect";
import { StoreAdministration } from "src/react/store/storeAdministration";
import { configEffectRunner } from "./configEffectRunner";

export const effectHandler = (storeAdministration: StoreAdministration) => {
  // config effect runner for store
  configEffectRunner({
    container: storeAdministration,
    context: storeAdministration.instance,
    pureContext: storeAdministration.pureInstance,
    effects: getEffectsMetaData(storeAdministration.type),
  });

  Array.from(storeAdministration.servicesInfo.values()).map((serviceInfo) => {
    const { context, pureContext } = serviceInfo;
    //config effect runner for service
    configEffectRunner({
      context,
      pureContext,
      container: serviceInfo,
      effects: getEffectsMetaData(pureContext.constructor),
    });
  });
};
