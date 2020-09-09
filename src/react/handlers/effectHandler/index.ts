import { dequal } from "dequal";
import { useEffect } from "react";
import { EFFECTS } from "src/constant";
import { EffectMetaData } from "src/decorators/effect";
import Store from "src/react/store";
import getDepsValues from "./getDepsValue";
import runEffect from "./runEffect";

const effectHandler = (store: Store) => {
  const effects: EffectMetaData[] =
    Reflect.get(store.constructorType, EFFECTS) || [];

  effects.forEach(({ propertyKey: effectKey, options }) => {
    useEffect(() => {
      const effect = store.getEffect(effectKey);
      if (effect?.isCalledOnce) {
        const depsValues = getDepsValues(store, effectKey);
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
          runEffect(store, effectKey, depsValues);
        }
      } else {
        runEffect(store, effectKey);
      }
    });
  });
};

export default effectHandler;
