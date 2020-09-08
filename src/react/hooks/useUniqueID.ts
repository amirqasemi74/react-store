import { useRef } from "react";
import uid from "src/utils/uid";

export default function useUniqueID() {
  return useRef(uid()).current;
}
