import { Inject } from "..";
import { ClassType } from "src/types";

export function Store() {
  return function (StoreType: ClassType) {
    StoreMetadataUtils.set(StoreType);
    Inject()(StoreType);
  } as ClassDecorator;
}

export class StoreMetadataUtils {
  private static KEY = Symbol();

  static set(storeType: ClassType) {
    Reflect.defineMetadata(this.KEY, true, storeType);
  }

  static is(storeType: ClassType): boolean {
    return !!Reflect.getOwnMetadata(this.KEY, storeType);
  }
}
