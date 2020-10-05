import { getConstructorDependencyTypes } from "src/decorators/inject";
import { ClassType } from "src/types";

class Container {
  private instances = new Map<Function, object>();

  resolve(SomeClass: ClassType): InstanceType<ClassType> {
    let instance = this.instances.get(SomeClass);
    if (!instance) {
      instance = new SomeClass(...this.resolveDependencies(SomeClass));
      this.instances.set(SomeClass, instance!);
    }
    return instance;
  }

  resolveDependencies(someClass: ClassType) {
    return getConstructorDependencyTypes(someClass).map((dep) =>
      this.resolve(dep.type as ClassType)
    );
  }

  private hasCircularDependency(SomeClass: ClassType) {
    const detectCircularDependency = (
      SomeClass: ClassType,
      depsPath: ClassType[]
    ) => {
      const deps = getConstructorDependencyTypes(SomeClass);
      console.log(SomeClass.name, deps);

      for (const { type } of deps) {
        if (type === SomeClass) {
          throw new Error(
            `Circular Dependency Detected: ${[...depsPath, type as ClassType]
              .map((d) => d.name)
              .join(" -> ")}`
          );
        }
        detectCircularDependency(type as ClassType, [
          ...depsPath,
          type as ClassType,
        ]);
      }
    };
    detectCircularDependency(SomeClass, [SomeClass]);
  }

  remove(someClass: ClassType) {
    this.instances.delete(someClass);
  }

  clearContainer() {
    this.instances.clear();
  }
}

const defaultContainer = new Container();

export const getFromContainer = <T extends ClassType>(
  someClass: T,
  container = defaultContainer
): InstanceType<T> => container.resolve(someClass);

export const removeFromContainer = (
  someClass: ClassType,
  container = defaultContainer
) => container.remove(someClass);

export const resolveDepsFromContainer = (
  someClass: ClassType,
  container = defaultContainer
) => container.resolveDependencies(someClass);

export const clearContainer = (container = defaultContainer) =>
  container.clearContainer();
