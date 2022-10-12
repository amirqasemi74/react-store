import { decoratorsMetadataStorage } from "../utils/decoratorsMetadataStorage";
import { ClassType } from "src/types";

export function Observable() {
  return function (target: ClassType) {
    decoratorsMetadataStorage.add("Observable", target, true);
  } as ClassDecorator;
}

export type ObservableMetadata = boolean;
