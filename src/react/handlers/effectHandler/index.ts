import { useEffect } from "react";
import { EFFECTS } from "src/constant";
import Store from "src/react/store";
import getDepsValues from "./getDepsValue";
import runEffect from "./runEffect";

const effectHandler = (store: Store) => {
  const effects: PropertyKey[] =
    Reflect.get(store.constructorType, EFFECTS) || [];
  effects.forEach((effectKey) => {
    useEffect(() => {
      const effect = store.getEffect(effectKey);
      if (effect?.isCalledOnce) {
        const { isDepsEqual, depsValues } = getDepsValues(store, effectKey);

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
