import { getEffectsMetaData } from "src/decorators/effect";
import StoreAdministration from "src/react/storeAdministration";
import cofingEffectRunner from "./cofingEffectRunner";

const effectHandler = (storeAdministration: StoreAdministration) => {
  // config effect runner for store
  cofingEffectRunner({
    container: storeAdministration,
    context: storeAdministration.instance,
    pureContext: storeAdministration.pureInstance,
    metaData: getEffectsMetaData(storeAdministration.constructorType),
  });

  Array.from(storeAdministration.servicesInfo.values()).map((serviceInfo) => {
    const { context, pureContext } = serviceInfo;
    //config effect runner for service
    cofingEffectRunner({
      container: serviceInfo,
      context,
      pureContext,
      metaData: getEffectsMetaData(pureContext.constructor),
    });
  });
};

export default effectHandler;
