import { InjectMetadataUtils } from "src/decorators/inject";
import { InjectableMetadataUtils, Scope } from "src/decorators/Injectable";
import { ClassType } from "src/types";
import { Injector } from "./Injector";

class Container {
  private instances = new Map<Function, object>();

  resolve(SomeClass: ClassType): InstanceType<ClassType> {
    const scope = InjectableMetadataUtils.get(SomeClass);

    if (!scope) {
      throw new Error(
        `${SomeClass.name} has not been decorated with @Injectable()`
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
          this.instances.set(SomeClass, instance!);
        }
        return instance;
      }
    }
  }

  resolveDependencies(someClass: ClassType) {
    return InjectMetadataUtils.getDependenciesDecoratedWith(
      someClass,
      "INJECTABLE"
    ).map((dep) => this.resolve(dep.type as ClassType));
  }

  remove(someClass: ClassType) {
    this.instances.delete(someClass);
  }

  clearContainer() {
    this.instances.clear();
    defaultContainer.resolve(Injector);
  }
}

export const defaultContainer = new Container();

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
