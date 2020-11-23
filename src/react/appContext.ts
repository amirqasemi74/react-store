import React from "react";
import { getFromContainer } from "src/container";
import { getConstructorDependencyTypes } from "src/decorators/inject";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import { getStoreAdministration } from "src/utils/utils";
import StoreAdministration from "./storeAdministration";

interface ResolveStoreArgs {
  StoreType: ClassType;
  id?: string;
  type?: "context";
  storeDeps?: Map<Function, StoreAdministration>;
}

interface CurrentRunnigEffect {
  depsList?: () => any[];
  clearEffect?: () => void;
}

export default class ReactAppContext {
  private storeAdministrations: StoreAdministration[] = [];

  private storeAdministrationContexts = new Map<
    Function,
    React.Context<StoreAdministration | null>
  >();

  currentRunningEffect: CurrentRunnigEffect;

  resolveStoreAdmin({ StoreType, id, storeDeps }: ResolveStoreArgs) {
    let storeAdministration = this.storeAdministrations.find(
      (s) => s.id === id && s.constructorType === StoreType
    );

    const allStoreDepTypes = getConstructorDependencyTypes(StoreType);

    const depsValue = allStoreDepTypes.map(
      (dep) =>
        storeDeps?.get(dep.type)?.instance ??
        getFromContainer(dep.type as ClassType)
    );

    if (!storeAdministration) {
      const store = new StoreType(...depsValue);
      storeAdministration =
        getStoreAdministration(store) || new StoreAdministration();
      storeAdministration.init({
        id: id || uid(),
        instance: store,
      });
      this.storeAdministrations.push(storeAdministration);
    }
    return storeAdministration;
  }

  removeStoreAdmin(id: string) {
    this.storeAdministrations = this.storeAdministrations.filter(
      (admin) => admin.id !== id
    );
  }
  registerStoreContext(
    storeType: Function,
    context: React.Context<StoreAdministration | null>
  ) {
    this.storeAdministrationContexts.set(storeType, context);
  }

  findStoreContext(storeType: Function) {
    return this.storeAdministrationContexts.get(storeType);
  }
}
