import { useEffect } from "react";
import { useLazyRef } from "./useLazyRef";

export const useWillMount = (fn: () => (() => void) | void) => {
  const clearEffect = useLazyRef(fn).current;
  useEffect(() => {
    return clearEffect;
  }, [clearEffect]);
};
