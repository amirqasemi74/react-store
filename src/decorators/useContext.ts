import React from "react";
import { STORE_USED_CONTEXTES } from "src/constant";
import { StoreUsedContext } from "src/react/handlers/contextHandler";

export default function UseContext(
  context: React.Context<any>
): PropertyDecorator {
  return (target, propertyKey) => {
    const ctxes: StoreUsedContext[] =
      Reflect.get(target.constructor, STORE_USED_CONTEXTES) || [];
    ctxes.push({
      propertyKey,
      type: context
    });
    Reflect.set(target.constructor, STORE_USED_CONTEXTES, ctxes);
  };
}
