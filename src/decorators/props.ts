import { ClassType } from "src/types";

export function Props(): PropertyDecorator {
  return function (target, propertyKey) {
    StorePropsMetadataUtils.set(target.constructor as ClassType, propertyKey);
  };
}

export class StorePropsMetadataUtils {
  private static readonly KEY = Symbol();

  static set(storeType: ClassType, propertyKey: PropertyKey) {
    Reflect.defineMetadata(this.KEY, propertyKey, storeType);
  }

  static get(storeType: ClassType): PropertyKey | undefined {
    return Reflect.getOwnMetadata(this.KEY, storeType);
  }

  static is(storeType: ClassType, propertyKey: PropertyKey) {
    return this.get(storeType) === propertyKey;
  }
}
