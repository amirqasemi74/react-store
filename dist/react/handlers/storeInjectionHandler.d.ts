import { ClassType } from "../../types";
import StoreAdministration from "../storeAdministration";
declare const storeInjectionHandler: (storeType: ClassType) => Map<Function, StoreAdministration>;
export default storeInjectionHandler;
