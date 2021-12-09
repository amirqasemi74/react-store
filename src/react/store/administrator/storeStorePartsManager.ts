import { isStorePart } from "src/decorators/storePart";
import { getStoreAdministrator } from "src/utils/utils";
import type { StoreAdministrator } from "./storeAdministrator";

export class StoreStorePartsManager {
  storeParts = new Map<PropertyKey, StoreAdministrator>();

  constructor(private storeAdmin: StoreAdministrator) {}

  initEffectsContainers() {
    Object.entries<any>(this.storeAdmin.instance).forEach(
      ([propertyKey, value]) => {
        if (
          value &&
          isStorePart(value.constructor) &&
          !this.storeParts.has(propertyKey)
        ) {
          const storePart = getStoreAdministrator(value)!;
          storePart.injectedInTos.add(this.storeAdmin);
          this.storeParts.set(propertyKey, storePart);
        }
      }
    );
  }
}
