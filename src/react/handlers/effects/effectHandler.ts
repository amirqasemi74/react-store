import { StoreAdministrator } from "src/react/store/storeAdministrator";
import { configEffectRunner } from "./configEffectRunner";

export const effectHandler = (storeAdministrator: StoreAdministrator) => {
  // config effect runner for store
  configEffectRunner(storeAdministrator);
  Array.from(storeAdministrator.storeParts.values()).forEach(
    configEffectRunner
  );
};
