import React from "react";
import { getFromContainer } from "src/container/container";
import { ReactApplicationContext } from "src/react/appContext";
import { EnhancedStoreFactory } from "src/react/store/enhancedStoreFactory";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";

export function Store(): ClassDecorator {
  return function (StoreType: any) {
    const EnhancedStoreType = EnhancedStoreFactory.create(StoreType);

    const context = React.createContext<StoreAdministrator | null>(null);
    context.displayName = `${StoreType.name}`;
    // store context provider in app container
    // to use context ref in useStore to get context value
    getFromContainer(ReactApplicationContext).registerStoreContext(
      EnhancedStoreType,
      context
    );

    return EnhancedStoreType;
  } as any;
}
