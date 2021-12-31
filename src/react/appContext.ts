import { Injectable } from "..";
import { StoreAdministrator } from "./store/administrator/storeAdministrator";
import React from "react";

@Injectable()
export class ReactApplicationContext {
  private storeContexts = new Map<
    Function,
    React.Context<StoreAdministrator | null>
  >();

  registerStoreContext(
    storeType: Function,
    context: React.Context<StoreAdministrator | null>
  ) {
    this.storeContexts.set(storeType, context);
  }

  getStoreReactContext(storeType: Function) {
    return this.storeContexts.get(storeType);
  }
}
