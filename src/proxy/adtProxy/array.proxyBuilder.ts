import { PROXIED_VALUE, proxyValueAndSaveIt } from "../proxyValueAndSaveIt";
import { BaseAdtProxyBuilderArgs } from "./adtProxyBuilder";
import { TARGET } from "src/constant";

interface ArrayProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  array: unknown[];
}

export const arrayProxyBuilder = ({
  array,
  ...restOfArgs
}: ArrayProxyBuilderArgs): unknown[] => {
  const { onSet } = restOfArgs;
  const isFrozen = Object.isFrozen(array);

  return new Proxy(isFrozen ? [...array] : array, {
    get(target: unknown[], propertyKey: PropertyKey, receiver: unknown) {
      if (propertyKey === TARGET) {
        return target;
      }
      const value = proxyValueAndSaveIt(
        isFrozen ? array : target,
        propertyKey,
        receiver,
        restOfArgs
      );
      restOfArgs.onAccess?.({
        value,
        target,
        type: "GET",
        propertyKey,
      });
      return value;
    },

    set(
      target: unknown[],
      propertyKey: PropertyKey,
      value: unknown,
      receiver: unknown
    ) {
      restOfArgs.onAccess?.({
        target,
        value,
        type: "SET",
        propertyKey,
      });
      const res = Reflect.set(target, propertyKey, value, receiver);
      if (propertyKey !== PROXIED_VALUE) {
        onSet?.();
      }
      return res;
    },
  });
};
