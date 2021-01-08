import objectPath from "object-path";
import { EffectMetaData } from "src/decorators/effect";
import { EffectsContainer } from "./effectContainer";
import { runEffect } from "./runEffect";
import { useEnhancedEffect } from "./useEnhancedEffect";

interface EffectRunnerOptions {
  container: EffectsContainer;
  metaData: EffectMetaData[];
  context: object;
  pureContext: object;
}
export const cofingEffectRunner = ({
  context,
  metaData,
  container,
  pureContext,
}: EffectRunnerOptions) => {
  metaData.forEach(({ propertyKey: effectKey, options }) => {
    const effect = container.getEffect(effectKey);

    useEnhancedEffect(
      () => {
        runEffect({
          context,
          container,
          effectKey,
          pureContext,
        });

        return () => effect?.clearEffect?.();
      },
      effect?.deps?.() || [],
      options
    );
  });
};
