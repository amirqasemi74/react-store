import { StoreAdministrator } from "./storeAdministrator";
import { useEffect } from "react";
import { StorePropsMetadataUtils } from "src/decorators/props";

export class PropsManager {
  constructor(private storeAdmin: StoreAdministrator) {}

  register() {
    this.storeAdmin.hooksManager.reactHooks.add({
      when: "AFTER_INSTANCE",
      hook: (storeAdmin, props) => {
        const propsPropertyKey = StorePropsMetadataUtils.get(storeAdmin.type);
        if (propsPropertyKey) {
          /**
           * We set only for effects dependencies or..
           */
          storeAdmin.propertyKeysManager.onSetPropertyKey(propsPropertyKey, props, {
            forceSet: true,
          });

          /**
           * Again set and render for store consumers
           */
          useEffect(() => {
            storeAdmin.propertyKeysManager.onSetPropertyKey(
              propsPropertyKey,
              props,
              { forceSet: true, forceRender: true }
            );
          }, [props]);
        }
      },
    });
  }
}
