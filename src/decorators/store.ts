export function Store(): ClassDecorator {
  return function (StoreType: any) {
    StoreMetadataUtils.setStore(StoreType);
  };
}

export class StoreMetadataUtils {
  private static IS_STORE = Symbol();

  static setStore(storeType: any) {
    Reflect.defineMetadata(StoreMetadataUtils.IS_STORE, true, storeType);
  }

  static isStore(storeType: any) {
    return Reflect.getOwnMetadata(StoreMetadataUtils.IS_STORE, storeType);
  }
}
