import { getEffectsMetaData } from "src/decorators/effect";
import Store from "src/react/store";
import cofingEffectRunner from "./cofingEffectRunner";

const effectHandler = (store: Store) => {
  // config effect runner for store
  cofingEffectRunner({
    container: store,
    context: store.instance,
    pureContext: store.pureInstance,
    metaData: getEffectsMetaData(store.constructorType),
  });

  Array.from(store.servicesInfo.values()).map((serviceInfo) => {
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
