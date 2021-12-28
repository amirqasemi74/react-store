import { uid } from "./uid";
import { useState } from "react";

export const useForceUpdate = () => {
  const [, setRenderKey] = useState(() => uid());
  return () => setRenderKey(uid());
};
