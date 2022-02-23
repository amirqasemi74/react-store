import {
  BaseAdtProxyBuilderArgs,
  adtProxyBuilder,
} from "./adtProxy/adtProxyBuilder";
import { STORE_ADMINISTRATION } from "src/constant";
import { isPrimitive } from "src/utils/isPrimitive";

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

  if (isPrimitive(value) || (value && value[STORE_ADMINISTRATION])) {
    return value;
  }

  const proxiedValue = () =>
    adtProxyBuilder({
      value,
      ...adtProxyBuilderArgs,
    });

  if (Object.isExtensible(value)) {
    return value[PROXIED_VALUE] || (value[PROXIED_VALUE] = proxiedValue());
  }

  return proxiedValue();
}

export const PROXIED_VALUE = Symbol("PROXIED_VALUE");
