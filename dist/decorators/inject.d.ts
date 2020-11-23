export default function (...deps: any[]): any;
interface ConstructorDependency {
    parameterIndex: number;
    type: Function;
}
export declare const CONSTRUCTOR_DEPENDENCY_TYPES: unique symbol;
export declare const getConstructorDependencyTypes: (consructorType: Function) => ConstructorDependency[];
export {};
