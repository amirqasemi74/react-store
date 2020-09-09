import { EFFECTS } from "src/constant";

interface EffectOptions {
  dequal?: boolean;
}

export interface EffectMetaData {
  propertyKey: PropertyKey;
  options: EffectOptions;
}

const Effect = (options: EffectOptions = {}): MethodDecorator => (
  target,
  propertyKey,
  descriptor
) => {
  const effects: EffectMetaData[] =
    Reflect.get(target.constructor, EFFECTS) || [];
  effects.push({ options, propertyKey });
  Reflect.set(target.constructor, EFFECTS, effects);
  return descriptor;
};

export default Effect;
