import { Injectable } from "./decorators/Injectable";
import type { StoreAdministrator } from "./store/administrator/storeAdministrator";
import React from "react";
import type { ClassType } from "src/types";

@Injectable()
export class ReactApplicationContext {
  prefetchedStores = new Map<ClassType, InstanceType<ClassType>>();

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
