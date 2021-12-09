import React from "react";
import { Injectable } from "src/decorators/Injectable";
import { StoreAdministrator } from "./store/administrator/storeAdministrator";

@Injectable()
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
