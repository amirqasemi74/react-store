import { STORE_REF } from "src/constant";
import { isPropsPropertyKey } from "src/decorators/props";
import { isService } from "src/decorators/service";
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

  if (
    !Object.isFrozen(value) &&
    !isPropsPropertyKey(target.constructor, propertyKey) &&
    !isInArrayOrObjectPrototype(target, propertyKey) &&
    value &&
    !value[STORE_REF] &&
    (value.constructor === Object ||
      value.constructor === Array ||
      value instanceof Function ||
      (value instanceof Object && isService(value.constructor)))
  ) {
    const proxiedValue = () =>
      adtProxyBuilder({
        value,
        context: receiver,
        ...adtProxyBuilderArgs,
      });

    return {
      pureValue: value,
      value: adtProxyBuilderArgs.cacheProxied
        ? value[PROXYED_VALUE] || (value[PROXYED_VALUE] = proxiedValue())
        : proxiedValue(),
    };
  }

  return { pureValue: value, value };
}

const PROXYED_VALUE = Symbol("PROXYED_VALUE");

const isInArrayOrObjectPrototype = (target: any, propertyKey: PropertyKey) =>
  (target.constructor === Object && Object.prototype[propertyKey]) ||
  (target.constructor === Array && Array.prototype[propertyKey]);
