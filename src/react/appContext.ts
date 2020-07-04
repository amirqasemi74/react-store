import { Context } from "react";
import { getFromContainer } from "src/container";
import { Injectable } from "src/decorators/Injectable";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import Store from "./store";

interface ResolveStoreArgs {
  StoreType: ClassType;
  id?: string;
  type?: "context";
  storeDeps?: { dep: ClassType; value: object }[];
}

interface StoreContext {
  context: Context<Store | null>;
  storeType: ClassType;
}

@Injectable
export default class ReactAppContext {
  private stores: Store[] = [];

  private storeContexts: StoreContext[] = [];

  resolveStore({ StoreType, id, storeDeps }: ResolveStoreArgs): Store {
    let store = this.stores.find((s) => s.id === id && s.type === StoreType);
    const deps: ClassType[] =
      Reflect.getMetadata("design:paramtypes", StoreType) || [];

    const depsValue = deps.map((dep) => {
      const storeDep = storeDeps?.find((sd) => sd.dep === dep);
      return storeDep ? storeDep.value : getFromContainer(dep);
    });

    if (!store) {
      store = new Store({
        id: id || uid(),
        instance: new StoreType(...depsValue),
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
