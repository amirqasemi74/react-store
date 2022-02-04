import { MutableRefObject, useRef } from "react";

/**
 * React useRef not accept lazy values. here we made it
 * @param initValFunc
 */
export const useLazyRef = <T>(initValFunc: () => T) => {
  const inited = useRef(false);
  const ref = useRef() as MutableRefObject<T>;
  if (!inited.current) {
    inited.current = true;
    ref.current = initValFunc();
  }
  return ref;
};

export const useFixedLazyRef = <T>(initValFunc: () => T) => {
  const inited = useRef(false);
  const ref = useRef() as MutableRefObject<T>;
  if (!inited.current) {
    inited.current = true;
    ref.current = initValFunc();
  }
  return ref.current;
};
