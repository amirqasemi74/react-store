import { EffectMetaData } from "src/decorators/effect";
import { isStorePart } from "src/decorators/storePart";
import { getStoreAdministrator, getType } from "src/utils/utils";
import { STORE_ADMINISTRATION } from "../../constant";
import { EFFECTS } from "../../decorators/effect";
import { StorePropertyKey } from "./storePropertyKey";
import { StoreForComponentUsageProxy } from "./storeForComponentUsageProxy";

export class StoreAdministrator {
  type: Function;

  instance: any;

  instanceForComponents: any;

  propertyKeys = new Map<PropertyKey, StorePropertyKey>();

  methods = new Map<PropertyKey, Function | null>();

  consumers = new Set<Function>();

  storeParts = new Map<PropertyKey, StoreAdministrator>();

  injectedInTos = new Set<StoreAdministrator>();

  private effects = new Map<PropertyKey, Effect>();

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
    this.initStorePartsEffectsContainers();
  }

  private initStorePartsEffectsContainers() {
    Object.entries<any>(this.instance).forEach(([propertyKey, value]) => {
      if (
        value &&
        isStorePart(value.constructor) &&
        !this.storeParts.has(propertyKey)
      ) {
        const storePart = getStoreAdministrator(value)!;
        // storePart.addInjectedInto(this);
        this.storeParts.set(propertyKey, storePart);
      }
    });
  }

  get effectsMetaData(): EffectMetaData[] {
    return Reflect.getMetadata(EFFECTS, this.type) || [];
  }

  storeEffect(effectKey: PropertyKey, effect: Effect) {
    this.effects.set(effectKey, effect);
  }

  getEffect(effectKey: PropertyKey) {
    return this.effects.get(effectKey);
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

interface Effect {
  clearEffect?: (() => void) | null;
}
