import { Inject } from "..";
import { decoratorsMetadataStorage } from "../utils/decoratorsMetadataStorage";
import { ClassType } from "src/types";

export function StorePart() {
  return function (StorePartType: ClassType) {
    decoratorsMetadataStorage.add("StorePart", StorePartType, true);
    Inject()(StorePartType);
  } as ClassDecorator;
}

export type StorePartMetadata = boolean;
