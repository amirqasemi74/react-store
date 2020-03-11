import { getType } from "src/utils/utils";
import { ClassType } from "src/types";

export class Container {
  private instances: object[] = [];

  resolve(someClass: ClassType): InstanceType<ClassType> {
    let instance = this.instances.find(i => getType(i) === someClass);
    if (!instance) {
      instance = new someClass(...this.resolveDependencies(someClass));
      this.instances.push(instance!);
    }
    return instance;
  }

  resolveDependencies(someClass: ClassType) {
    const deps: ClassType[] =
      Reflect.getMetadata("design:paramtypes", someClass) || [];
    return deps.map(d => this.resolve(d));
  }

  remove(someClass: ClassType) {
    const index = this.instances.findIndex(i => getType(i) === someClass);
    if (index !== -1) {
      this.instances.splice(index, 1);
    }
  }

  clearContainer() {
    this.instances = [];
  }
}

const defaultContainer = new Container();

export const getFromContainer = <T extends ClassType>(
  someClass: T,
  container = defaultContainer
): InstanceType<T> => defaultContainer.resolve(someClass);

export const removeFromContainer = (
  someClass: ClassType,
  container = defaultContainer
) => defaultContainer.remove(someClass);

export const resolveDepsFromContainer = (
  someClass: ClassType,
  container = defaultContainer
) => defaultContainer.resolveDependencies(someClass);

export const clearContainer = () => defaultContainer.clearContainer();
