import { DependencyList, EffectCallback, useEffect, useRef } from "react";
import { dequal } from "dequal";
import cloneDeep from "clone-deep";
import { useLazyRef } from "src/utils/useLazyRef";

export const useEnhancedEffect = (
  callback: EffectCallback,
  deps?: DependencyList,
  options?: { dequal?: boolean }
) => {
  if (options?.dequal && deps) {
    const signal = useRef(0);
    const preDeps = useLazyRef(() => cloneDeep(deps, true));
    const isEqual = options?.dequal ? dequal : Object.is;
    for (let i = 0; i < deps.length; i++) {
      if (!isEqual(deps[i], preDeps.current?.[i])) {
        preDeps.current = cloneDeep(deps, true);
        signal.current += 1;
        break;
      }
    }
    useEffect(callback, [signal.current]);
  } else {
    useEffect(callback, deps);
  }
};
