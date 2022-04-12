import { deepUnproxy } from "../deepUnproxy";
import { proxyValueAndSaveIt } from "../proxyValueAndSaveIt";
import { BaseAdtProxyBuilderArgs } from "./adtProxyBuilder";
import React from "react";
import { TARGET } from "src/constant";

interface ObjectProxyBuilderArgs extends BaseAdtProxyBuilderArgs {
  object: object;
}

export const objectProxyBuilder = ({
  object,
  ...restOfArgs
}: ObjectProxyBuilderArgs): object => {
  if (React.isValidElement(object)) {
    return object;
  }

  const { onSet } = restOfArgs;
  const isFrozen = Object.isFrozen(object);

  return new Proxy(isFrozen ? { ...object } : object, {
    get(target: object, propertyKey: PropertyKey, receiver: unknown) {
      if (propertyKey === TARGET) {
        return target;
      }

      const value = proxyValueAndSaveIt(
        isFrozen ? object : target,
        propertyKey,
        receiver,
        restOfArgs
      );
      return value;
    },

    set(
      target: object,
      propertyKey: PropertyKey,
      value: unknown,
      receiver: unknown
    ) {
      const res = Reflect.set(target, propertyKey, deepUnproxy(value), receiver);
      onSet?.();
      return res;
    },
  });
};
