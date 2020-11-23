declare const dependencyExtarctor: (getSetLogs: GetSetLog[], pureContext: object, type?: GetSet) => string[];
export declare type GetSet = "GET" | "SET";
export interface GetSetLog {
    type: GetSet;
    target: any;
    propertyKey: PropertyKey;
    value: any;
}
export default dependencyExtarctor;
