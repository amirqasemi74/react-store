import { EffectMetaData } from "src/decorators/effect";
import { EffectsContainer } from "./effectContainer";
import { runEffect } from "./runEffect";
import { useEnhancedEffect } from "./useEnhancedEffect";

interface EffectRunnerOptions {
  container: EffectsContainer;
  effects: EffectMetaData[];
  context: object;
  pureContext: object;
}
export const configEffectRunner = ({
  effects,
  context,
  container,
  pureContext,
}: EffectRunnerOptions) => {
  effects.forEach(({ propertyKey: effectKey, options: { deps, dequal } }) => {
    useEnhancedEffect(
      () => {
        runEffect({
          context,
          container,
          effectKey,
          pureContext,
        });
        return () => container.getEffect(effectKey)?.clearEffect?.();
      },
      deps?.(context),
      { dequal }
    );
  });
};
