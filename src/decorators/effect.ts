export const EFFECTS = Symbol("EFFECTS");

/**
 * *********************** Decorator *********************
 */
interface EffectOptions<T extends {} = any> {
  deps?: (_: T) => Array<any>;
  dequal?: boolean;
}

export interface EffectMetaData {
  propertyKey: PropertyKey;
  options: EffectOptions;
}

export function Effect<T extends {} = any>(
  deps?: (_: T) => Array<any>,
  dequal?: boolean
): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    let options: EffectOptions = {
      deps,
      dequal,
    };

    const effects: EffectMetaData[] =
      Reflect.getMetadata(EFFECTS, target.constructor) || [];

    effects.push({ options, propertyKey });

    Reflect.defineMetadata(EFFECTS, effects, target.constructor);
    return descriptor;
  };
}
