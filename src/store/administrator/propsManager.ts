import { StoreAdministrator } from "./storeAdministrator";
import { StorePropsMetadataUtils } from "src/decorators/props";

export class PropsManager {
  constructor(private storeAdmin: StoreAdministrator) {}

  register() {
    this.storeAdmin.hooksManager.reactHooks.add({
      when: "AFTER_INSTANCE",
      hook: (storeAdmin, props) => {
        const propsPropertyKey = StorePropsMetadataUtils.get(storeAdmin.type);
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
