import { Injectable } from ".";
import { StoreAdministrator } from "./store/administrator/storeAdministrator";
import React from "react";
import { ClassType } from "src/types";

@Injectable()
export class ReactApplicationContext {
  private storeContexts = new Map<ClassType, StoreAdministratorReactContext>();

  registerStoreContext(
    storeType: ClassType,
    context: StoreAdministratorReactContext
  ) {
    this.storeContexts.set(storeType, context);
  }

  getStoreReactContext(storeType: ClassType) {
    return this.storeContexts.get(storeType);
  }
}

export type StoreAdministratorReactContext = React.Context<{
  id: string;
  storeAdmin: StoreAdministrator;
} | null>;
