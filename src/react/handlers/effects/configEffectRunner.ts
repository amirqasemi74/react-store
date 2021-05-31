import { StoreAdministrator } from "src/react/store/storeAdministrator";
import { runEffect } from "./runEffect";
import { useEnhancedEffect } from "./useEnhancedEffect";

export const configEffectRunner = (storeAdmin: StoreAdministrator) => {
  storeAdmin.effectsMetaData.forEach(
    ({ propertyKey: effectKey, options: { deps, dequal } }) => {
      useEnhancedEffect(
        () => {
          runEffect({
            effectKey,
            storeAdmin,
          });
          return () => storeAdmin.getEffect(effectKey)?.clearEffect?.();
        },
        deps?.(storeAdmin.instance),
        { dequal }
      );
    }
  );
};
