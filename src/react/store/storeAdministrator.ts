import { EffectMetaData } from "src/decorators/effect";
import { isStorePart } from "src/decorators/storePart";
import adtProxyBuilder from "src/proxy/adtProxy/adtProxyBuilder";
import { getStoreAdministrator, getType } from "src/utils/utils";
import { STORE_ADMINISTRATION } from "../../constant";
import { EFFECTS } from "../../decorators/effect";

export class StoreAdministrator {
  type: Function;

  instance: any;

  pureInstance: any;

  propertyKeysValue = new Map<PropertyKey, any>();

  consumers: Function[] = [];

  storeParts = new Map<PropertyKey, StoreAdministrator>();

  private effects = new Map<PropertyKey, Effect>();

  private injectedIntos = new Set<StoreAdministrator>();

  private isRenderAllow = true;

  private runningActionsCount = 0;

  constructor(instance: any) {
    this.pureInstance = instance;
    this.type = getType(instance)!;
    instance[STORE_ADMINISTRATION] = this;
    this.instance = adtProxyBuilder({
      value: instance,
      onSet: this.renderConsumers.bind(this),
    });

    // to access store in deep proxy for effects handler
    this.turnOffRender();
    this.instance[STORE_ADMINISTRATION] = this.pureInstance[
      STORE_ADMINISTRATION
    ] = this;
    this.initStorePartsEffectsContainers();
    this.turnOnRender();
  }

  private initStorePartsEffectsContainers() {
    Object.entries<any>(this.pureInstance).forEach(([propertyKey, value]) => {
      if (
        value &&
        isStorePart(value.constructor) &&
        !this.storeParts.has(propertyKey)
      ) {
        const storePart = getStoreAdministrator(value)!;
        storePart.addInjectedInto(this);
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

  addInjectedInto(storeAdmin: StoreAdministrator) {
    this.injectedIntos.add(storeAdmin);
  }

  turnOffRender() {
    this.isRenderAllow = false;
  }

  turnOnRender() {
    this.isRenderAllow = true;
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

  renderConsumers() {
    if (this.isRenderAllow && this.runningActionsCount == 0) {
      this.consumers.forEach((render) => render());
      Array.from(this.injectedIntos.values()).forEach((storeAdmin) =>
        storeAdmin.renderConsumers()
      );
    }
  }
}

interface Effect {
  clearEffect?: (() => void) | null;
}
