import { Inject } from "./inject";
import "reflect-metadata";
import { ClassType } from "src/types";
import { decoratorsMetadataStorage } from "src/utils/decoratorsMetadataStorage";

export function Injectable(scope = Scope.SINGLETON): ClassDecorator {
  return function (target: ClassType) {
    decoratorsMetadataStorage.add("Injectable", target, scope);
    Inject()(target);
  } as ClassDecorator;
}

export enum Scope {
  SINGLETON = "SINGLETON",
  TRANSIENT = "TRANSIENT",
}

export type InjectableMetadata = Scope;
