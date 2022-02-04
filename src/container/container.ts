import { InjectableMetadataUtils, Scope } from "./decorators/Injectable";
import { InjectMetadataUtils } from "src/container/decorators/inject";
import { ClassType } from "src/types";

class Container {
  private instances = new Map<ClassType, InstanceType<ClassType>>();

  resolve<T>(SomeClass: ClassType<T>): InstanceType<ClassType<T>> {
    const scope = InjectableMetadataUtils.get(SomeClass);

    if (!scope) {
      throw new Error(
        `\`class ${SomeClass.name}\` has not been decorated with @Injectable()`
      );
    }

    switch (scope) {
      case Scope.TRANSIENT: {
        return new SomeClass(...this.resolveDependencies(SomeClass));
      }
      case Scope.SINGLETON:
      default: {
        let instance = this.instances.get(SomeClass);
        if (!instance) {
          instance = new SomeClass(...this.resolveDependencies(SomeClass));
          this.instances.set(SomeClass, instance);
        }
        return instance as InstanceType<ClassType<T>>;
      }
    }
  }

  resolveDependencies(someClass: ClassType) {
    return InjectMetadataUtils.getDependenciesDecoratedWith(
      someClass,
      "INJECTABLE"
    ).map((dep) => this.resolve(dep.type));
  }

  remove(someClass: ClassType) {
    this.instances.delete(someClass);
  }

  clearContainer() {
    this.instances.clear();
  }
}

export const defaultContainer = new Container();

export const getFromContainer = <T extends ClassType>(
  someClass: T,
  container = defaultContainer
): InstanceType<T> => container.resolve(someClass) as InstanceType<T>;

export const removeFromContainer = (
  someClass: ClassType,
  container = defaultContainer
) => container.remove(someClass);

export const clearContainer = (container = defaultContainer) =>
  container.clearContainer();
