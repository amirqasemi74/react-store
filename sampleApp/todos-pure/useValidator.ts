import { useEffect, useState } from "react";

export const useValidator = (value: string) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(!value);
  }, [value]);

  return hasError;
};
