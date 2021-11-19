import React, { Context, useEffect, useState } from "react";
import { ClassType } from "src/types";
import { registerHandlers } from "../handlers/registerHandlers";
import { StoreAdministrator } from "./storeAdministrator";
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

      Array.from(storeAdministrator.propertyKeys.values()).forEach(
        StoreContextProviderFactory.createUseStateForPropertyKey
      );
      StoreContextProviderFactory.registerUseStateForStoreParts(
        storeAdministrator
      );
      registerHandlers(storeAdministrator, props);

      /**
       * Here all store useStates are placed and TheContext.Provider is memo by default
       * So if here we have rerender here we must rerender store consumers.
       */
      useEffect(() => {
        if (storeAdministrator.isFirstRenderOccurred) {
          storeAdministrator?.renderConsumers(true);
        } else {
          storeAdministrator.isFirstRenderOccurred = true;
        }
      });

      return (
        <TheContext.Provider value={storeAdministrator}>
          {children}
        </TheContext.Provider>
      );
    };
  }

  private static registerUseStateForStoreParts(storeAdmin: StoreAdministrator) {
    Array.from(storeAdmin.storeParts.values()).forEach((sp) => {
      Array.from(sp.propertyKeys.values()).forEach(
        this.createUseStateForPropertyKey
      );
      this.registerUseStateForStoreParts(sp);
    });
  }

  private static createUseStateForPropertyKey(info: StorePropertyKey) {
    const [state, setState] = useState(() =>
      info.isPrimitive ? info.getValue("Store") : { $: info.getValue("Store") }
    );
    info.setValue(state, "State");
    info.reactSetState = setState;
  }
}
