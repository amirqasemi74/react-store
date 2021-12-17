import { EnhancedStoreFactory } from "src/react/store/enhancedStoreFactory";

/**
 * ******************* Decorator *********************
 */
export function StorePart(): ClassDecorator {
  return function (StoreType: any) {
    // TODO: must be removed
    const EnhancedStoreType = EnhancedStoreFactory.create(StoreType);
    StorePartMetadataUtils.set(StoreType);
    return EnhancedStoreType;
  } as any;
}

export class StorePartMetadataUtils {
  private static readonly KEY = Symbol();

  static set(storeType: Function) {
    Reflect.defineMetadata(this.KEY, {}, storeType);
  }

  static is(storeType: Function) {
    return !!Reflect.getMetadata(this.KEY, storeType);
  }
}
