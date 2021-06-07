const PROPS_PROPERTY_KEY = Symbol();

export function Props(): PropertyDecorator {
  return function (target, propertyKey) {
    Reflect.defineMetadata(PROPS_PROPERTY_KEY, propertyKey, target.constructor);
  };
}

export const getStorePropsPropertyKey = (
  target: Function
): PropertyKey | undefined => Reflect.getMetadata(PROPS_PROPERTY_KEY, target);

export const isPropsPropertyKey = (
  target: Function,
  propertyKey: PropertyKey
) => {
  return Reflect.getMetadata(PROPS_PROPERTY_KEY, target) === propertyKey;
};
