import { configEffectRunner } from "./configEffectRunner";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";

export const effectHandler = (storeAdministrator: StoreAdministrator) => {
  // config effect runner for store
  configEffectRunner(storeAdministrator);
  Array.from(storeAdministrator.storePartsManager.storeParts.values()).forEach(
    configEffectRunner
  );
};
