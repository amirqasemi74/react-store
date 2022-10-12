import { decoratorsMetadataStorage } from "../utils/decoratorsMetadataStorage";
import { ClassType } from "src/types";

export function Wire(type: ClassType): PropertyDecorator {
  return function (target, propertyKey) {
    decoratorsMetadataStorage.add<WireMetadata>(
      "Wire",
      target.constructor as ClassType,
      {
        propertyKey,
        type,
      }
    );
  };
}

export interface WireMetadata {
  type: ClassType;
  propertyKey: PropertyKey;
}
