import {
  BaseAdtProxyBuilderArgs,
  adtProxyBuilder,
} from "./adtProxy/adtProxyBuilder";
import { TARGET } from "src/constant";
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

  if (storage.has(value?.[TARGET])) {
    return storage.get(value?.[TARGET]);
  }

  if (isPrimitive(value) || typeof value === "function") {
    return value;
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
