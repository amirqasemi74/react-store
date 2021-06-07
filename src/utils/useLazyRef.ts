import { useRef, MutableRefObject } from "react";

/**
 * React useRef not accept lazy values. here we made it
 * @param initValFunc
 */
export const useLazyRef = <T>(initValFunc: () => T) => {
  const ref: MutableRefObject<T> = useRef(null) as any;
  if (ref.current === null) {
    ref.current = initValFunc();
  }
  return ref;
};
