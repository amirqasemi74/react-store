import { decoratorsMetadataStorage } from "../utils/decoratorsMetadataStorage";
import type { ClassType } from "src/types";

export function PreFetch(): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    decoratorsMetadataStorage.add(
      "PreFetch",
      target.constructor as ClassType,
      propertyKey
    );
    return descriptor;
  };
}

export type PrefetchMetadata = PropertyKey;
