import { decoratorsMetadataStorage } from "../utils/decoratorsMetadataStorage";
import { ClassType, Func } from "src/types";

export function Hook(hook: Func): PropertyDecorator {
  return function (target, propertyKey) {
    decoratorsMetadataStorage.add<HookMetadata>(
      "Hook",
      target.constructor as ClassType,
      {
        propertyKey,
        hook,
      }
    );
  };
}

export interface HookMetadata {
  hook: Func;
  propertyKey: PropertyKey;
}
