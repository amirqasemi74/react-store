import React from "react";
import { STORE_USED_CONTEXTS } from "src/constant";
import { StoreUsedContext } from "src/react/handlers/usedContextsHandler";

export function UseContext(context: React.Context<any>): PropertyDecorator {
  return (target, propertyKey) => {
    const ctxs: StoreUsedContext[] =
      Reflect.get(target.constructor, STORE_USED_CONTEXTS) || [];
    ctxs.push({
      propertyKey,
      type: context,
    });
    Reflect.set(target.constructor, STORE_USED_CONTEXTS, ctxs);
  };
}
