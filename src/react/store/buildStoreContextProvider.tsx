import React, { Context, useEffect } from "react";
import { ClassType } from "src/types";
import { useForceUpdate } from "src/utils/useForceUpdate";
import { registerHandlers } from "../handlers/registerHandlers";
import { StoreAdministratorFactory } from "./StoreAdministorFactory";
import { StoreAdministrator } from "./StoreAdministrator";

interface ProviderComponentProps {
  props?: any;
}

export const buildStoreContextProvider =
  (
    TheContext: Context<StoreAdministrator | null>,
    StoreType: ClassType
  ): React.FC<ProviderComponentProps> =>
  ({ children, props }) => {
    const render = useForceUpdate();
    const storeAdministrator = StoreAdministratorFactory.create(StoreType);

    useEffect(() => {
      storeAdministrator.consumers.push({ render });
    }, []);

    registerHandlers(storeAdministrator, props);

    return (
      <TheContext.Provider value={storeAdministrator}>
        {children}
      </TheContext.Provider>
    );
  };
