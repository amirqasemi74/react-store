export const dep = (deps?: () => any[], clearEffect?: () => void) => {
  return {
    deps,
    clearEffect,
    DEP_RETURN_VALUE: true,
  };
};

export const DEP_RETURN_VALUE = Symbol("DEP_RETURN_VALUE");
