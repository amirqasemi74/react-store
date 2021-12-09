import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";
import { configEffectRunner } from "./configEffectRunner";

export const effectHandler = (storeAdministrator: StoreAdministrator) => {
  // config effect runner for store
  configEffectRunner(storeAdministrator);
  Array.from(storeAdministrator.storePartsManager.storeParts.values()).forEach(
    configEffectRunner
  );
};
