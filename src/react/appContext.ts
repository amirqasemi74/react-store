import React from "react";
import { ClassType } from "src/types";
import { StoreAdministrator } from "./store/StoreAdministrator";

interface ResolveStoreArgs {
  id?: string;
  StoreType: ClassType;
  storeDeps?: Map<Function, StoreAdministrator>;
}

export class ReactApplicationContext {
  private storeAdministratorContexts = new Map<
    Function,
    React.Context<StoreAdministrator | null>
  >();

  registerStoreContext(
    storeType: Function,
    context: React.Context<StoreAdministrator | null>
  ) {
    this.storeAdministratorContexts.set(storeType, context);
  }

  getStoreReactContext(storeType: Function) {
    return this.storeAdministratorContexts.get(storeType);
  }
}
