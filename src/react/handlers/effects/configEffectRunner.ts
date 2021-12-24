import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";
import { runEffect } from "./runEffect";
import { useEnhancedEffect } from "./useEnhancedEffect";

export const configEffectRunner = (storeAdmin: StoreAdministrator) => {
  storeAdmin.effectsManager.effectsMetaData.forEach(
    ({ propertyKey: effectKey, options: { deps, dequal } }) => {
      useEnhancedEffect(
        () => {
          runEffect({
            effectKey,
            storeAdmin,
          });
          return () => storeAdmin.effectsManager.getClearEffect(effectKey)?.();
        },
        deps?.(storeAdmin.instanceForComponents),
        { dequal }
      );
    }
  );
};
