export function Effect<T extends {} = any>(
  deps?: (_: T) => Array<any>,
  dequal?: boolean
): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    StoreEffectsMetadataUtils.add(target.constructor, {
      options: {
        deps,
        dequal,
      },
      propertyKey,
    });
    return descriptor;
  };
}

export class StoreEffectsMetadataUtils {
  private static readonly KEY = Symbol();

  static get(storeType: Function): EffectMetaData[] {
    let effects = Reflect.getOwnMetadata(this.KEY, storeType);
    if (!effects) {
      effects = [];
      Reflect.defineMetadata(this.KEY, effects, storeType);
    }
    return effects;
  }

  static add(storeType: Function, metadata: EffectMetaData) {
    this.get(storeType).push(metadata);
  }
}

interface EffectOptions<T extends {} = any> {
  deps?: (_: T) => Array<any>;
  dequal?: boolean;
}

export interface EffectMetaData {
  propertyKey: PropertyKey;
  options: EffectOptions;
}
