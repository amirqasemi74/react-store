import { useRef } from "react";
import uid from "src/utils/uid";
import useLazyRef from "src/utils/useLazyRef";

export default function useUniqueID() {
  return useLazyRef(() => uid()).current;
}
