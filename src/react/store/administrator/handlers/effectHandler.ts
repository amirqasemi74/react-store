import isPromise from "is-promise";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";
import { Func } from "src/types";
import { useEnhancedEffect } from "src/utils/useEnhancedEffect";

export const effectHandler = (storeAdmin: StoreAdministrator) => {
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

interface RunEffectArgs {
  effectKey: PropertyKey;
  storeAdmin: StoreAdministrator;
}

const runEffect = ({ effectKey, storeAdmin }: RunEffectArgs) => {
  //run ...
  const clearEffect: Func<void> | undefined = Reflect.apply(
    storeAdmin.instanceForComponents[effectKey],
    storeAdmin.instanceForComponents,
    []
  );

  if (clearEffect && !isPromise(clearEffect) && typeof clearEffect === "function") {
    storeAdmin.effectsManager.setClearEffect(effectKey, clearEffect);
  }
};
