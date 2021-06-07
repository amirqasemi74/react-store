import { useState } from "react";
import { uid } from "./uid";

export const useForceUpdate = () => {
  const [, setRenderKey] = useState(() => uid());
  return () => setRenderKey(uid());
};
