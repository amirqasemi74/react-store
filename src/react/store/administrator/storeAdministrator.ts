import { STORE_ADMINISTRATION } from "../../../constant";
import { StoreForComponentUsageProxy } from "../storeForComponentUsageProxy";
import { StoreGettersManager } from "./getters/storeGettersManager";
import { propsHandler } from "./handlers/propsHandler";
import { HooksManager } from "./hooksManager";
import { StorePropertyKeysManager } from "./propertyKeys/storePropertyKeysManager";
import { StoreEffectsManager } from "./storeEffectsManager";
import { StoreMethodsManager } from "./storeMethodsManager";
import { StoreStorePartsManager } from "./storeStorePartsManager";
import ReactDOM from "react-dom";
import { ClassType, Func } from "src/types";

export class StoreAdministrator {
  type: ClassType;

  instance: InstanceType<ClassType>;

  instanceForComponents: InstanceType<ClassType>;

  consumers = new Set<Func>();

  injectedInTos = new Set<StoreAdministrator>();

  methodsManager = new StoreMethodsManager(this);

  effectsManager = new StoreEffectsManager(this);

  storePartsManager = new StoreStorePartsManager(this);

  propertyKeysManager = new StorePropertyKeysManager(this);

  gettersManager = new StoreGettersManager(this);

  hooksManager = new HooksManager(this);

  constructor(type: ClassType) {
    this.type = type;
    this.storePartsManager.createInstances();
    this.hooksManager.reactHooks.add({
      when: "AFTER_INSTANCE",
      hook: propsHandler,
    });
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
    this.storePartsManager.register();
    this.hooksManager.register();
    this.propertyKeysManager.registerUseStates();
    this.propertyKeysManager.makeAllObservable();
    this.effectsManager.registerEffects();
    this.gettersManager.makeAllAsComputed();
    this.methodsManager.makeAllAutoBound();
  }

  renderConsumers() {
    ReactDOM.unstable_batchedUpdates(() => {
      this.propertyKeysManager.doPendingSetStates();
      this.consumers.forEach((render) => render());
      this.injectedInTos.forEach((st) => st.renderConsumers());
    });
  }
}
