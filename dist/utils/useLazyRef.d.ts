import { MutableRefObject } from "react";
declare const useLazyRef: <T>(initialValFunc: () => T) => MutableRefObject<T>;
export default useLazyRef;
