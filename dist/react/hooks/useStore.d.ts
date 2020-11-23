import { ClassType } from "../../types";
export interface ComponentDeps {
    paths: string[];
    status: "RESOLVED" | "UNRESOLVED";
}
declare const useStore: <T extends ClassType<any> = any>(storeType: T) => InstanceType<T>;
export default useStore;
