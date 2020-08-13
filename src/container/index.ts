import { ClassType } from "src/types";
import { getConstructorDepsType } from "src/utils/utils";

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
    return getConstructorDepsType(someClass).map((d) => this.resolve(d));
  }

  remove(someClass: ClassType) {
    this.instances.delete(someClass);
  }

  clearContainer() {
    // this.instances = new Map();
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
