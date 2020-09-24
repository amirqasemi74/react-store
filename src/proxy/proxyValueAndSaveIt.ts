import { STORE_REF } from "src/constant";
import adtProxyBuilder, { BaseAdtProxyBuilderArgs } from "./adtProxy";

/**
 * Proxy value if need and then proxied value for next usage
 * - Array & Object prototype methods and properties will not proxied
 * - Object & Array & Fucntion proxied values only will save
 */
export default function proxyValueAndSaveIt(
  target: any,
  propertyKey: PropertyKey,
  receiver: any,
  adtProxyBuilderArgs: BaseAdtProxyBuilderArgs
): { value: any; pureValue: any } {
  const value = Reflect.get(target, propertyKey, receiver);

  if (propertyKey === PROXYED_VALUE) {
    return {
      pureValue: value,
      value,
    };
  }

  // Not proxy Object or Array methods
  if (
    (target.constructor === Object && Object.prototype[propertyKey]) ||
    (target.constructor === Array && Array.prototype[propertyKey])
  ) {
    return {
      pureValue: value,
      value,
    };
  }

  if (
    value &&
    (value.constructor === Object ||
      value.constructor === Array ||
      value instanceof Function) &&
    !value[STORE_REF]
  ) {
    return {
      pureValue: value,
      value:
        value[PROXYED_VALUE] ||
        (value[PROXYED_VALUE] = adtProxyBuilder({
          value,
          context: receiver,
          ...adtProxyBuilderArgs,
        })),
    };
  }

  return { pureValue: value, value };
}

const PROXYED_VALUE = Symbol("PROXYED_VALUE");
