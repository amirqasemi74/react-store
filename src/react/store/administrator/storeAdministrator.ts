import { STORE_ADMINISTRATION } from "../../../constant";
import { StoreForComponentUsageProxy } from "../storeForComponentUsageProxy";
import { StoreGettersManager } from "./getters/storeGettersManager";
import { HooksManager } from "./hooksManager";
import { StorePropertyKeysManager } from "./propertyKeys/storePropertyKeysManager";
import { PropsManager } from "./propsManager";
import { StoreEffectsManager } from "./storeEffectsManager";
import { StoreMethodsManager } from "./storeMethodsManager";
import { StoreStorePartsManager } from "./storeStorePartsManager";
import React from "react";
import { ClassType } from "src/types";

export class StoreAdministrator {
  type: ClassType;

  instance: InstanceType<ClassType>;

  injectedInTos = new Set<StoreAdministrator>();

  instanceForComponents: InstanceType<ClassType>;

  contextRenderId?: React.MutableRefObject<number>;

  propsManager = new PropsManager(this);

  hooksManager = new HooksManager(this);

  gettersManager = new StoreGettersManager(this);

  methodsManager = new StoreMethodsManager(this);

  effectsManager = new StoreEffectsManager(this);

  storePartsManager = new StoreStorePartsManager(this);

  propertyKeysManager = new StorePropertyKeysManager(this);

  constructor(type: ClassType, contextRenderId?: React.MutableRefObject<number>) {
    this.type = type;
    this.contextRenderId = contextRenderId;
    this.storePartsManager.createInstances();
  }

  static get(store: object) {
    return (store[STORE_ADMINISTRATION] as StoreAdministrator) || null;
  }

  setInstance(instance: InstanceType<ClassType>) {
    this.instance = instance;
    this.instance[STORE_ADMINISTRATION] = this;
    this.instanceForComponents = new Proxy(
      this.instance,
      new StoreForComponentUsageProxy()
    );

    // !!!! Orders matter !!!!
    this.propsManager.register();
    this.storePartsManager.register();
    this.hooksManager.register();
    this.propertyKeysManager.registerUseStates();
    this.propertyKeysManager.makeAllObservable();
    this.effectsManager.registerEffects();
    this.gettersManager.makeAllAsComputed();
    this.methodsManager.makeAllAutoBound();
  }

  renderConsumers() {
    if (this.contextRenderId) {
      this.contextRenderId.current++;
    }
    this.propertyKeysManager.doPendingSetStates();
    this.injectedInTos.forEach((st) => st.renderConsumers());
  }
}
