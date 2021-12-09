import React, { Context, useState } from "react";
import { ClassType } from "src/types";
import { registerHandlers } from "../handlers/registerHandlers";
import { StoreAdministrator } from "./administrator/storeAdministrator";
import { StoreAdministratorFactory } from "./storeAdministratorFactory";
import { StorePropertyKey } from "./storePropertyKey";

interface ProviderComponentProps {
  props?: any;
}

export class StoreContextProviderFactory {
  static create(
    TheContext: Context<StoreAdministrator | null>,
    StoreType: ClassType
  ): React.FC<ProviderComponentProps> {
    return function StoreContextProviderBuilder({ children, props }) {
      const storeAdministrator = StoreAdministratorFactory.create(StoreType);

      Array.from(
        storeAdministrator.propertyKeysManager.propertyKeys.values()
      ).forEach(StoreContextProviderFactory.createUseStateForPropertyKey);
      StoreContextProviderFactory.registerUseStateForStoreParts(
        storeAdministrator
      );
      registerHandlers(storeAdministrator, props);

      return (
        <TheContext.Provider value={storeAdministrator}>
          {children}
        </TheContext.Provider>
      );
    };
  }

  private static registerUseStateForStoreParts(storeAdmin: StoreAdministrator) {
    Array.from(storeAdmin.storePartsManager.storeParts.values()).forEach(
      (sp) => {
        Array.from(sp.propertyKeysManager.propertyKeys.values()).forEach(
          this.createUseStateForPropertyKey
        );
        this.registerUseStateForStoreParts(sp);
      }
    );
  }

  private static createUseStateForPropertyKey(info: StorePropertyKey) {
    const [state, setState] = useState(() =>
      info.isPrimitive ? info.getValue("Store") : { $: info.getValue("Store") }
    );
    info.setValue(state, "State");
    info.reactSetState = setState;
  }
}
