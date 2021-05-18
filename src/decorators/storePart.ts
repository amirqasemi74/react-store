import { createEnhancedStoreType } from "./store";

const STORE_PART_OPTIONS = Symbol("STORE_PART_OPTIONS");

/**
 * ******************* Decorator *********************
 */
export function StorePart(): ClassDecorator {
  return function (StoreType: any) {
    const EnhancedStoreType = createEnhancedStoreType(StoreType);
    Reflect.defineMetadata(STORE_PART_OPTIONS, {}, EnhancedStoreType);
    return EnhancedStoreType;
  } as any;
}

/**
 * ********************* Utils ************************
 */
export const isStorePart = (target: Function) => {
  return !!Reflect.getMetadata(STORE_PART_OPTIONS, target);
};
