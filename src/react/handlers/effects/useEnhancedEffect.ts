import { DependencyList, EffectCallback, useEffect, useRef } from "react";
import { dequal } from "dequal";

export const useEnhancedEffect = (
  callback: EffectCallback,
  deps: DependencyList,
  options?: { dequal?: boolean }
) => {
  const signal = useRef(0);
  const preDeps = useRef(deps);
  const isEqual = options?.dequal ? dequal : Object.is;

  for (let i = 0; i < deps.length; i++) {
    if (!isEqual(deps[i], preDeps.current[i])) {
      preDeps.current = deps;
      signal.current += 1;
      break;
    }
  }
  useEffect(callback, [signal.current]);
};
