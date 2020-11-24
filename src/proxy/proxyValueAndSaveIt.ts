import { STORE_ADMINISTRATION } from "src/constant";
import { isService } from "src/decorators/service";
import { getStoreAdministration } from "src/utils/utils";
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
    value &&
    !value[STORE_ADMINISTRATION] &&
    // Frozen Object does not need to be proxied (observable) like React Props
    !Object.isFrozen(value) &&
    !isInArrayOrObjectPrototype(target, propertyKey) &&
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

    // Storing bound method in it self
    // cause to store it for store type not
    // store instance
    if (value instanceof Function) {
      const propertyKeysValue = getStoreAdministration(target)
        ?.instancePropsValue;

      return {
        pureValue: value,
        value: propertyKeysValue
          ? propertyKeysValue.get(propertyKey) ||
            propertyKeysValue.set(propertyKey, proxiedValue()).get(propertyKey)
          : value,
      };
    }

    return {
      pureValue: value,
      value: adtProxyBuilderArgs.cacheProxied
        ? value[PROXYED_VALUE] || (value[PROXYED_VALUE] = proxiedValue())
        : proxiedValue(),
    };
  }

  return { pureValue: value, value };
}

export const PROXYED_VALUE = Symbol("PROXYED_VALUE");

const isInArrayOrObjectPrototype = (target: any, propertyKey: PropertyKey) =>
  (target.constructor === Object && Object.prototype[propertyKey]) ||
  (target.constructor === Array && Array.prototype[propertyKey]);
