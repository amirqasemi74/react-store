import { Inject } from "..";

export function StorePart(): ClassDecorator {
  return function (StorePartType: any) {
    StorePartMetadataUtils.set(StorePartType);
    Inject()(StorePartType);
  };
}

export class StorePartMetadataUtils {
  private static readonly KEY = Symbol();

  static set(storeType: Function) {
    Reflect.defineMetadata(this.KEY, {}, storeType);
  }

  static is(storeType: Function) {
    return !!Reflect.getOwnMetadata(this.KEY, storeType);
  }
}
