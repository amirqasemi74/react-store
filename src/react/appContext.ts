import React from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import Store from "./store";
import { getDepsConstructorType } from "src/utils/utils";

interface ResolveStoreArgs {
  StoreType: ClassType;
  id?: string;
  type?: "context";
  storeDeps?: Map<Function, object>;
}

interface CurrentRunnigEffect {
  depsList: () => any[];
  clearEffect: () => void;
}

export default class ReactAppContext {
  private stores: Store[] = [];

  private storeContexts = new Map<Function, React.Context<Store | null>>();

  currentRunningEffect: CurrentRunnigEffect;

  resolveStore({ StoreType, id, storeDeps }: ResolveStoreArgs): Store {
    let store = this.stores.find(
      (s) => s.id === id && s.constructorType === StoreType
    );

    const depsValue = getDepsConstructorType(StoreType).map(
      (dep) => storeDeps?.get(dep) ?? getFromContainer(dep)
    );

    if (!store) {
      store = new Store({
        id: id || uid(),
        instance: new StoreType(...depsValue),
      });
      this.stores.push(store);
    }
    return store;
  }

  registerStoreContext(
    storeType: Function,
    context: React.Context<Store | null>
  ) {
    this.storeContexts.set(storeType, context);
  }

  findStoreContext(storeType: Function) {
    return this.storeContexts.get(storeType);
  }
}
