import { useState } from "react";

export const useForceUpdate = () => {
  const [, setRenderKey] = useState(1);
  return () => setRenderKey((pre) => ++pre);
};
