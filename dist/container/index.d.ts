import { ClassType } from "../types";
declare class Container {
    private instances;
    resolve(SomeClass: ClassType): InstanceType<ClassType>;
    resolveDependencies(someClass: ClassType): any[];
    private hasCircularDependency;
    remove(someClass: ClassType): void;
    clearContainer(): void;
}
export declare const getFromContainer: <T extends ClassType<any>>(someClass: T, container?: Container) => InstanceType<T>;
export declare const removeFromContainer: (someClass: ClassType, container?: Container) => void;
export declare const resolveDepsFromContainer: (someClass: ClassType, container?: Container) => any[];
export declare const clearContainer: (container?: Container) => void;
export {};
