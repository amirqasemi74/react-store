export function Props(): PropertyDecorator {
  return function (target, propertyKey) {
    StorePropsMetadataUtils.set(target.constructor, propertyKey);
  };
}

export class StorePropsMetadataUtils {
  private static readonly KEY = Symbol();

  static set(storeType: Function, propertyKey: PropertyKey) {
    Reflect.defineMetadata(this.KEY, propertyKey, storeType);
  }

  static get(storeType: Function): PropertyKey | undefined {
    return Reflect.getOwnMetadata(this.KEY, storeType);
  }

  static is(storeType: Function, propertyKey: PropertyKey) {
    return this.get(storeType) === propertyKey;
  }
}
