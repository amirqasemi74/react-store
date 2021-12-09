import { STORE_ADMINISTRATION } from "src/constant";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";

export class EnhancedStoreFactory {
  static create(StoreType: any) {
    const EnhancedStoreType = class extends StoreType {
      constructor(...args: any) {
        super(...args);
        // first set default values to store admin
        Reflect.set(this, STORE_ADMINISTRATION, new StoreAdministrator(this));
      }
    } as any;

    // change constructor name for improve debugging
    Reflect.defineProperty(EnhancedStoreType, "name", {
      writable: false,
      value: StoreType.name,
    });

    return EnhancedStoreType;
  }
}
