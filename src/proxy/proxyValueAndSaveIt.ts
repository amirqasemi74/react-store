import {
  BaseAdtProxyBuilderArgs,
  adtProxyBuilder,
} from "./adtProxy/adtProxyBuilder";
import { STORE_ADMINISTRATION } from "src/constant";

/**
 * Proxy value if need and then proxied value for next usage
 * - Array & Object prototype methods and properties will not proxied
 * - Object & Array & Function proxied values only will save
 */
export function proxyValueAndSaveIt(
  target: object,
  propertyKey: PropertyKey,
  receiver: unknown,
  adtProxyBuilderArgs: BaseAdtProxyBuilderArgs
) {
  const value = Reflect.get(target, propertyKey, receiver);

  if (propertyKey === PROXIED_VALUE) {
    return value;
  }

  if (
    value &&
    !value[STORE_ADMINISTRATION] &&
    !isInArrayOrObjectPrototype(target, propertyKey) &&
    [Object, Array, Map].includes(value.constructor)
  ) {
    const proxiedValue = () =>
      adtProxyBuilder({
        value,
        ...adtProxyBuilderArgs,
      });

    return value[PROXIED_VALUE] || (value[PROXIED_VALUE] = proxiedValue());
  }

  return value;
}

export const PROXIED_VALUE = Symbol("PROXIED_VALUE");

const isInArrayOrObjectPrototype = (target: object, propertyKey: PropertyKey) =>
  (target.constructor === Object && Object.prototype[propertyKey]) ||
  (target.constructor === Array && Array.prototype[propertyKey]);
