import { useEffect } from "react";
import { useFixedLazyRef } from "./useLazyRef";

export const useWillMount = (fn: () => (() => void) | void) => {
  const clearEffect = useFixedLazyRef(fn);
  useEffect(() => {
    return clearEffect;
  }, [clearEffect]);
};
