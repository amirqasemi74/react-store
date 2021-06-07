import React, { Context } from "react";
import { ClassType } from "src/types";
import { useForceUpdate } from "src/utils/useForceUpdate";
import { useLazyRef } from "src/utils/useLazyRef";
import { registerHandlers } from "../handlers/registerHandlers";
import { StoreAdministratorFactory } from "./storeAdministorFactory";
import { StoreAdministrator } from "./storeAdministrator";

interface ProviderComponentProps {
  props?: any;
}

export const buildStoreContextProvider = (
  TheContext: Context<StoreAdministrator | null>,
  StoreType: ClassType
): React.FC<ProviderComponentProps> =>
  function StoreContextProviderBuilder({ children, props }) {
    const render = useForceUpdate();
    const storeAdministrator = StoreAdministratorFactory.create(StoreType);

    useLazyRef(() => {
      storeAdministrator.consumers.push(render);
    });

    registerHandlers(storeAdministrator, props);

    return (
      <TheContext.Provider value={storeAdministrator}>
        {children}
      </TheContext.Provider>
    );
  };
