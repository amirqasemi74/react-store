import { StoreAdministrator } from "./storeAdministrator";
import { useEffect } from "react";
import { HooksMetadataUtils } from "src/decorators/hook";

export class HooksManager {
  reactHooks = new Set<StoreAdministratorReactHooks>();

  constructor(private storeAdmin: StoreAdministrator) {}

  register() {
    HooksMetadataUtils.get(this.storeAdmin.type).forEach(({ hook, propertyKey }) => {
      this.reactHooks.add({
        when: "AFTER_INSTANCE",
        hook: () => hook(this.storeAdmin.instanceForComponents),
        result: (res) => {
          useEffect(() => {
            this.storeAdmin.propertyKeysManager.onSetPropertyKey(propertyKey, res);
          }, [res]);
        },
      });
    });
  }
}

export interface StoreAdministratorReactHooks {
  result?: (...args: any[]) => void;
  when: "BEFORE_INSTANCE" | "AFTER_INSTANCE";
  hook: (storeAdmin: StoreAdministrator, props?: object) => void;
}
