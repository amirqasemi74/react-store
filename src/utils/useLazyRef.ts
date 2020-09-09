import { useRef, MutableRefObject } from "react";

/**
 * React useRef not accept lazy values. here we made it
 * @param initialValFunc
 */
const useLazyRef = <T>(initialValFunc: () => T) => {
  const ref: MutableRefObject<T | null> = useRef(null);
  if (ref.current === null) {
    ref.current = initialValFunc();
  }
  return ref;
};

export default useLazyRef;
