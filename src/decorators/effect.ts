import { EFFECTS } from "src/react/constant";

const Effect = (): MethodDecorator => (target, propertyKey, descriptor) => {
  const effects: PropertyKey[] = Reflect.get(target.constructor, EFFECTS) || [];
  effects.push(propertyKey);
  Reflect.set(target.constructor, EFFECTS, effects);
  return descriptor;
};

export default Effect;
