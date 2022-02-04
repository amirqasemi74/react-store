import { Inject } from "..";
import { ClassType } from "src/types";

export function StorePart() {
  return function (StorePartType: ClassType) {
    StorePartMetadataUtils.set(StorePartType);
    Inject()(StorePartType);
  } as ClassDecorator;
}

export class StorePartMetadataUtils {
  private static readonly KEY = Symbol();

  static set(storeType: ClassType) {
    Reflect.defineMetadata(this.KEY, {}, storeType);
  }

  static is(storeType: ClassType) {
    return !!Reflect.getOwnMetadata(this.KEY, storeType);
  }
}
