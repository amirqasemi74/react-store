import { TARGET } from "src/constant";

// eslint-disable-next-line
export const getUnproxiedValue = (val: any, deep?: boolean) => {
  const v = val?.[TARGET] || val;
  return v?.[TARGET] && deep ? getUnproxiedValue(v, deep) : v;
};
