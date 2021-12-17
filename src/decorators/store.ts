export function Store(): ClassDecorator {
  return function (StoreType: any) {
    StoreMetadataUtils.set(StoreType);
  };
}

export class StoreMetadataUtils {
  private static KEY = Symbol();

  static set(storeType: any) {
    Reflect.defineMetadata(this.KEY, true, storeType);
  }

  static is(storeType: any): boolean {
    return !!Reflect.getOwnMetadata(this.KEY, storeType);
  }
}
