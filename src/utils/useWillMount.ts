import { useFixedLazyRef } from "./useLazyRef";
import { useEffect } from "react";

export const useWillMount = (fn: () => (() => void) | void) => {
  const clearEffect = useFixedLazyRef(fn);
  useEffect(() => clearEffect, []);
};
