import { StorePartMetadataUtils } from "src/decorators/storePart";
import { StoreAdministrator } from "./storeAdministrator";

export class StoreStorePartsManager {
  storeParts = new Map<PropertyKey, StoreAdministrator>();

  constructor(private storeAdmin: StoreAdministrator) {}

  initEffectsContainers() {
    Object.entries<any>(this.storeAdmin.instance).forEach(
      ([propertyKey, value]) => {
        if (
          value &&
          StorePartMetadataUtils.is(value.constructor) &&
          !this.storeParts.has(propertyKey)
        ) {
          const storePart = StoreAdministrator.get(value);
          storePart.injectedInTos.add(this.storeAdmin);
          this.storeParts.set(propertyKey, storePart);
        }
      }
    );
  }
}
