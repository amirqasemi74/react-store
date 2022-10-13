import { decoratorsMetadataStorage } from "../utils/decoratorsMetadataStorage";
import { ClassType } from "src/types";

export function Unobserve(): PropertyDecorator {
  return function (target, propertyKey) {
    decoratorsMetadataStorage.add(
      "Unobserve",
      target.constructor as ClassType,
      propertyKey
    );
  };
}

export type UnobserveMetadata = PropertyKey;
