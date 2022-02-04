import { Injectable } from "..";
import { StoreAdministrator } from "./store/administrator/storeAdministrator";
import React from "react";
import { ClassType } from "src/types";

@Injectable()
export class ReactApplicationContext {
  private storeContexts = new Map<
    ClassType,
    React.Context<StoreAdministrator | null>
  >();

  registerStoreContext(
    storeType: ClassType,
    context: React.Context<StoreAdministrator | null>
  ) {
    this.storeContexts.set(storeType, context);
  }

  getStoreReactContext(storeType: ClassType) {
    return this.storeContexts.get(storeType);
  }
}
