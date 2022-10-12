import { Inject } from "..";
import { decoratorsMetadataStorage } from "../utils/decoratorsMetadataStorage";
import { ClassType } from "src/types";

export function Store() {
  return function (StoreType: ClassType) {
    decoratorsMetadataStorage.add("Store", StoreType, true);
    Inject()(StoreType);
  } as ClassDecorator;
}

export type StoreMetadata = boolean;
