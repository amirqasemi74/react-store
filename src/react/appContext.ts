import { resolveDepsFromContainer } from "src/container";
import { ClassType } from "src/types";
import Store from "./store";
import { Context } from "react";
import uid from "src/utils/uid";
import { Injectable } from "src/decorators/Injectable";

interface ResolveStoreArgs {
  StoreType: ClassType;
  id?: string;
  type?: "context";
}

export interface StoreContextValue {
  storeInstance: any;
  renderKey: string;
}

interface StoreContext {
  context: Context<StoreContextValue>;
  storeType: ClassType;
}

@Injectable
export default class ReactAppContext {
  private stores: Store[] = [];

  private storeContexts: StoreContext[] = [];

  resolveStore({ StoreType, id, type }: ResolveStoreArgs): Store {
    let store = this.stores.find(
      (s) =>
        //local and contextual store
        s.id === id && s.type === StoreType
    );

    if (!store) {
      store = new Store({
        id: id || uid(),
        instance: new StoreType(...resolveDepsFromContainer(StoreType)),
      });
      this.stores.push(store);
    }

    return store;
  }

  registerStoreContext({ context, storeType }: StoreContext) {
    const provider = this.storeContexts.find(
      (sc) => sc.storeType === storeType
    );
    if (provider) {
      this.storeContexts = this.storeContexts.filter(
        (sc) => sc.storeType !== storeType
      );
    }
    this.storeContexts.push({ context, storeType });
  }

  findStoreContext(storeType: Function) {
    return this.storeContexts.find((sc) => sc.storeType === storeType);
  }
}
