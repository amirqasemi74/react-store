import { ObservableMetadataUtils } from "src/decorators/observable";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";
import { isPrimitive } from "src/utils/isPrimitive";

export const deepUnproxy = (val: unknown) => {
  if (isPrimitive(val)) return val;
  const unproxied = getUnproxiedValue(val, true);
  // eslint-disable-next-line
  const valType = (val as any)?.constructor;
  if (Object.isFrozen(unproxied)) return unproxied;

  if (
    valType === Array ||
    valType === Object ||
    (unproxied instanceof Object && ObservableMetadataUtils.is(valType))
  ) {
    Object.getOwnPropertyNames(unproxied).forEach((key: PropertyKey) => {
      unproxied[key] = deepUnproxy(unproxied[key]);
    });
    Object.getOwnPropertySymbols(unproxied).forEach((key: PropertyKey) => {
      unproxied[key] = deepUnproxy(unproxied[key]);
    });
  }
  return unproxied;
};
