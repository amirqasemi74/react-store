export const EFFECTS = Symbol("EFFECTS");

/**
 * *********************** Decorator *********************
 */
interface EffectOptions<T extends {} = any> {
  dequal?: boolean;
  deps?: (_: T) => Array<any>;
}

export interface EffectMetaData {
  propertyKey: PropertyKey;
  options: EffectOptions;
}

export function Effect<T extends {} = any>(
  arg: EffectOptions<T> | EffectOptions<T>["deps"] = {}
): MethodDecorator {
  return function (target, propertyKey, descriptor) {
    let options: EffectOptions;

    switch (typeof arg) {
      case "function":
        options = { deps: arg };
        break;
      case "object":
        options = arg;
        break;
      default:
        throw new Error("Invalid Effect argument");
    }

    const effects: EffectMetaData[] =
      Reflect.getMetadata(EFFECTS, target.constructor) || [];

    effects.push({ options, propertyKey });
    
    Reflect.defineMetadata(EFFECTS, effects, target.constructor);
    return descriptor;
  };
}
