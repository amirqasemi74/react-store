import { decoratorsMetadataStorage } from "../utils/decoratorsMetadataStorage";
import { ClassType } from "src/types";

export function Props(): PropertyDecorator {
  return function (target, propertyKey) {
    decoratorsMetadataStorage.add(
      "Props",
      target.constructor as ClassType,
      propertyKey
    );
  };
}

export type PropsMetadata = PropertyKey;
