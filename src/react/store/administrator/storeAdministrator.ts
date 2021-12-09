import { getType } from "src/utils/utils";
import { STORE_ADMINISTRATION } from "../../../constant";
import { StoreForComponentUsageProxy } from "../storeForComponentUsageProxy";
import { StoreEffectsManager } from "./storeEffectsManager";
import { StoreMethodsManager } from "./storeMethodsManager";
import { StorePropertyKeysManager } from "./storePropertyKeysManager";
import { StoreStorePartsManager } from "./storeStorePartsManager";

export class StoreAdministrator {
  type: Function;

  instance: any;

  instanceForComponents: any;

  consumers = new Set<Function>();

  injectedInTos = new Set<StoreAdministrator>();

  methodsManager = new StoreMethodsManager(this);

  effectsManager = new StoreEffectsManager(this);

  storePartsManager = new StoreStorePartsManager(this);

  propertyKeysManager = new StorePropertyKeysManager(this);

  private isStoreMutated = false;

  private runningActionsCount = 0;

  constructor(instance: any) {
    this.instance = instance;
    this.type = getType(instance)!;
    this.instance[STORE_ADMINISTRATION] = this;
    this.instanceForComponents = new Proxy(
      this.instance,
      new StoreForComponentUsageProxy()
    );

    this.storePartsManager.initEffectsContainers();
    this.propertyKeysManager.makeAllObservable();
    this.methodsManager.makeAllAsActions();
  }

  runAction(action: Function) {
    this.runningActionsCount++;
    const res = action();
    this.runningActionsCount--;
    if (this.runningActionsCount === 0) {
      this.renderConsumers();
    }
    return res;
  }

  renderConsumers(isStoreMutated?: true) {
    if (isStoreMutated !== undefined) {
      this.isStoreMutated = isStoreMutated;
    }
    if (this.isStoreMutated && this.runningActionsCount == 0) {
      this.isStoreMutated = false;
      this.consumers.forEach((render) => render());
      Array.from(this.injectedInTos.values()).forEach((st) =>
        st.renderConsumers(true)
      );
    }
  }
}
