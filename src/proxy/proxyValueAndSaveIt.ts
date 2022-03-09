import {
  BaseAdtProxyBuilderArgs,
  adtProxyBuilder,
} from "./adtProxy/adtProxyBuilder";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";
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
  const storage = adtProxyBuilderArgs.proxiedValuesStorage;
  const value = Reflect.get(target, propertyKey, receiver);

  if (isPrimitive(value) || typeof value === "function") {
    return value;
  }

  if (storage.has(getUnproxiedValue(value))) {
    return storage.get(getUnproxiedValue(value));
  }

  const proxiedValue = () =>
    adtProxyBuilder({
      value,
      ...adtProxyBuilderArgs,
    });

  if (!storage.has(value)) {
    storage.set(value, proxiedValue());
  }

  return storage.get(value);
}
