import { StoreAdministrator } from "./storeAdministrator";
import { HookMetadata } from "src/decorators/hook";
import { decoratorsMetadataStorage } from "src/utils/decoratorsMetadataStorage";

export class HooksManager {
  reactHooks = new Set<StoreAdministratorReactHooks>();

  constructor(private storeAdmin: StoreAdministrator) {}

  register() {
    decoratorsMetadataStorage
      .get<HookMetadata>("Hook", this.storeAdmin.type)
      .forEach(({ hook, propertyKey }) => {
        this.reactHooks.add({
          when: "AFTER_INSTANCE",
          hook: () => hook(this.storeAdmin.instanceForComponents),
          result: (res) => {
            this.storeAdmin.propertyKeysManager.onSetPropertyKey(
              propertyKey,
              res,
              true
            );
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
