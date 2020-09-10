const EFFECTS = Symbol("EFFECTS");

/**
 * *********************** Decorator *********************
 */
interface EffectOptions {
  dequal?: boolean;
}

export interface EffectMetaData {
  propertyKey: PropertyKey;
  options: EffectOptions;
}

export function Effect(options: EffectOptions = {}): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    const effects: EffectMetaData[] =
      Reflect.getMetadata(EFFECTS, target.constructor) || [];
    effects.push({ options, propertyKey });
    Reflect.defineMetadata(EFFECTS, effects, target.constructor);
    return descriptor;
  };
}

/**
 * ********************* Effects **********************
 */

export const getEffectsMetaData = (target: Function): EffectMetaData[] =>
  Reflect.getMetadata(EFFECTS, target) || [];
