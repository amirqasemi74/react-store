import { STORE_ADMINISTRATION } from "src/constant";
import { isStorePart } from "src/decorators/storePart";
import { getStoreAdministrator } from "src/utils/utils";
import adtProxyBuilder, {
  BaseAdtProxyBuilderArgs,
} from "./adtProxy/adtProxyBuilder";

/**
 * Proxy value if need and then proxied value for next usage
 * - Array & Object prototype methods and properties will not proxied
 * - Object & Array & Function proxied values only will save
 */
export default function proxyValueAndSaveIt(
  target: any,
  propertyKey: PropertyKey,
  receiver: any,
  adtProxyBuilderArgs: BaseAdtProxyBuilderArgs
) {
  const value = Reflect.get(target, propertyKey, receiver);

  if (propertyKey === PROXIED_VALUE) {
    return value;
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
      (value instanceof Object && isStorePart(value.constructor)))
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
      const propertyKeysValue =
        getStoreAdministrator(target)?.propertyKeysValue;

      return propertyKeysValue
        ? propertyKeysValue.get(propertyKey) ||
            propertyKeysValue.set(propertyKey, proxiedValue()).get(propertyKey)
        : value;
    }

    return value[PROXIED_VALUE] || (value[PROXIED_VALUE] = proxiedValue());
  }

  return value;
}

export const PROXIED_VALUE = Symbol("PROXIED_VALUE");

const isInArrayOrObjectPrototype = (target: any, propertyKey: PropertyKey) =>
  (target.constructor === Object && Object.prototype[propertyKey]) ||
  (target.constructor === Array && Array.prototype[propertyKey]);
