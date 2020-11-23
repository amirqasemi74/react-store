/// <reference types="react" />
import StoreAdministration from "../storeAdministration";
export interface StoreUsedContext {
    propertyKey: PropertyKey;
    type: React.Context<any>;
    value?: any;
}
declare const usedContextesHandler: (storeAdministration: StoreAdministration) => void;
export default usedContextesHandler;
