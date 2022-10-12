import { StoreAdministrator } from "./storeAdministrator";
import { PropsMetadata } from "src/decorators/props";
import { decoratorsMetadataStorage } from "src/utils/decoratorsMetadataStorage";

export class PropsManager {
  constructor(private storeAdmin: StoreAdministrator) {}

  register() {
    this.storeAdmin.hooksManager.reactHooks.add({
      when: "AFTER_INSTANCE",
      hook: (storeAdmin, props) => {
        const propsPropertyKey = decoratorsMetadataStorage.get<PropsMetadata>(
          "Props",
          storeAdmin.type
        )[0];
        if (propsPropertyKey) {
          storeAdmin.propertyKeysManager.onSetPropertyKey(
            propsPropertyKey,
            props,
            true
          );
        }
      },
    });
  }
}
