import { STORE_ADMINISTRATION } from "../../../constant";
import { StoreForComponentUsageProxy } from "../storeForComponentUsageProxy";
import { StoreGettersManager } from "./getters/storeGettersManager";
import { effectHandler } from "./handlers/effectHandler";
import { propsHandler } from "./handlers/propsHandler";
import { StorePropertyKeysManager } from "./propertyKeys/storePropertyKeysManager";
import { StoreEffectsManager } from "./storeEffectsManager";
import { StoreMethodsManager } from "./storeMethodsManager";
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

  gettersManager = new StoreGettersManager(this);

  reactHooks = new Set<StoreAdministratorReactHooks>();

  constructor(type: Function) {
    this.type = type;
    this.storePartsManager.createInstances();
    this.reactHooks.add({
      when: "AFTER_INSTANCE",
      hook: propsHandler,
    });
  }

  static get(store: object) {
    return (store[STORE_ADMINISTRATION] as StoreAdministrator) || null;
  }

  setInstance(instance: any) {
    this.instance = instance;
    this.instance[STORE_ADMINISTRATION] = this;
    this.instanceForComponents = new Proxy(
      this.instance,
      new StoreForComponentUsageProxy()
    );

    // !!!! Orders matter !!!!
    this.storePartsManager.register();
    this.propertyKeysManager.registerUseStates();
    this.propertyKeysManager.makeAllObservable();
    this.effectsManager.registerEffects();
    this.gettersManager.makeAllAsComputed();
    this.methodsManager.makeAllAutoBound();
  }

  renderConsumers() {
    this.consumers.forEach((render) => render());
    Array.from(this.injectedInTos.values()).forEach((st) => st.renderConsumers());
  }
}

export interface StoreAdministratorReactHooks {
  hook: (storeAdmin: StoreAdministrator, props: any) => void;
  when: "BEFORE_INSTANCE" | "AFTER_INSTANCE";
  result?: (result: any) => void;
}
