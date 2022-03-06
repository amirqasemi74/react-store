import { useCallback, useState } from "react";

export const useForceUpdate = () => {
  const [renderKey, setRenderKey] = useState(1);
  return [renderKey, useCallback(() => setRenderKey((pre) => ++pre), [])] as const;
};
