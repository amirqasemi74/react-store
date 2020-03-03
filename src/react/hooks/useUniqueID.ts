import { useRef } from "react";
import uid from "src/utils/uid";

export default function useUniqueID() {
  const id = useRef(uid());
  return id.current;
}
