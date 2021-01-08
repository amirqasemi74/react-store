export function Inject(...deps: any[]): any {
  return function (...decoArgs: any[]) {
    const isClassDecorator = decoArgs.length === 1;
    const isParameterDecorator =
      decoArgs.length === 3 &&
      decoArgs[1] === undefined &&
      typeof decoArgs[2] === "number";

    if (isClassDecorator) {
      const target = decoArgs[0];
      Reflect.defineMetadata(IS_INJECTED_USING_CLASS_DECORATOR, true, target);

      if (Reflect.getMetadata(IS_INJECTED_USING_PARAMETER_DECORATOR, target)) {
        throw new Error(`${target.name}: Dependencies are injecting by @Inject as parameter decorator. Simultaneous, using @Inject as class 
          decorator is not allow. remove one of them.
        `);
      }

      Reflect.defineMetadata(
        CONSTRUCTOR_DEPENDENCY_TYPES,
        deps
          .map<ConstructorDependency>((type, parameterIndex) => ({
            type,
            parameterIndex,
          }))
          .sort((a, b) => a.parameterIndex - b.parameterIndex),
        target
      );
    }

    if (isParameterDecorator) {
      const target = decoArgs[0];
      Reflect.defineMetadata(
        IS_INJECTED_USING_PARAMETER_DECORATOR,
        true,
        target
      );

      if (Reflect.getMetadata(IS_INJECTED_USING_CLASS_DECORATOR, target)) {
        throw new Error(`${target.name}: Dependencies are injecting by @Inject as class decorator. Simultaneous, using @Inject as parameter 
          decorator is not allow. remove one of them.
        `);
      }

      const constructorDepTypes: ConstructorDependency[] =
        Reflect.getMetadata(CONSTRUCTOR_DEPENDENCY_TYPES, target) || [];

      Reflect.defineMetadata(
        CONSTRUCTOR_DEPENDENCY_TYPES,
        constructorDepTypes
          .concat({ type: deps[0], parameterIndex: decoArgs[2] })
          .sort((a, b) => a.parameterIndex - b.parameterIndex),
        target
      );
    }
  };
}

interface ConstructorDependency {
  parameterIndex: number;
  type: Function;
}

export const CONSTRUCTOR_DEPENDENCY_TYPES = Symbol();
const IS_INJECTED_USING_CLASS_DECORATOR = Symbol();
const IS_INJECTED_USING_PARAMETER_DECORATOR = Symbol();

export const getConstructorDependencyTypes = (
  consructorType: Function
): ConstructorDependency[] =>
  Reflect.getMetadata(CONSTRUCTOR_DEPENDENCY_TYPES, consructorType) || [];
