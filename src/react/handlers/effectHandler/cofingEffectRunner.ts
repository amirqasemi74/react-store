import { dequal } from "dequal";
import objectPath from "object-path";
import { useEffect } from "react";
import { EffectMetaData } from "src/decorators/effect";
import EffectsContainer from "./effectContainer";
import runEffect from "./runEffect";

interface EffectRunnerOptions {
  container: EffectsContainer;
  metaData: EffectMetaData[];
  context: object;
  pureContext: object;
}
const cofingEffectRunner = ({
  metaData,
  container,
  pureContext,
  context,
}: EffectRunnerOptions) => {
  metaData.forEach(({ propertyKey: effectKey, options }) => {
    const getDepsValues = (effectKey: PropertyKey) => {
      const effect = container.getEffect(effectKey)!;
      return effect.deps.map((path) =>
        objectPath.withInheritedProps.get(pureContext, path)
      );
    };

    useEffect(() => {
      const effect = container.getEffect(effectKey);
      if (effect?.isCalledOnce) {
        const depsValues = getDepsValues(effectKey);
        const isEqual = options.dequal ? dequal : Object.is;

        let isDepsEqual = true;
        for (let i = 0; i < depsValues.length; i++) {
          if (!isEqual(depsValues[i], effect.depsValues[i])) {
            isDepsEqual = false;
            break;
          }
        }
        if (!isDepsEqual) {
          effect.clearEffect?.();
          runEffect({
            container,
            effectKey,
            pureContext,
            depsValues,
            context,
          });
        }
      } else {
        runEffect({ container, effectKey, pureContext, context });
      }
    });
  });
};

export default cofingEffectRunner;
