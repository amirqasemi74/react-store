import adtProxyBuilder from "src/proxy/adtProxy";
import { getType } from "src/utils/utils";
import { STORE_REF } from "../constant";

export default class Store {
  id: string;

  constructorType: Function;

  pureInstance: any;

  instance: any;

  consumers: StoreConsumer[] = [];

  private injectedIntos = new Map<string, StoreInjectedInto>();

  private isRenderAllow = true;

  private effects = new Map<PropertyKey, Effect>();

  constructor({ id, instance }: { id: string; instance: object }) {
    this.id = id;
    this.constructorType = getType(instance);
    this.pureInstance = instance;
    instance[STORE_REF] = this;
    this.instance = adtProxyBuilder({
      value: instance,
      store: this,
      allowRender: true,
      proxyTypes: ["Array", "Object"],
    });

    // to access store in deep proxy for effects handler
    this.turnOffRender();
    this.instance[STORE_REF] = this.pureInstance[STORE_REF] = this;
    this.turnOnRender();
  }

  turnOffRender() {
    this.isRenderAllow = false;
  }

  turnOnRender() {
    this.isRenderAllow = true;
  }

  renderConsumers() {
    if (this.isRenderAllow) {
      this.consumers.forEach((cnsr) => cnsr.render());
      this.injectedIntos.forEach(({ store }) => store.renderConsumers());
    }
  }
  /**
   * ******************** Effect Deps ********************
   */
  storeEffet(effectKey: PropertyKey, effect: Effect) {
    this.effects.set(effectKey, effect);
  }

  getEffect(effectKey: PropertyKey) {
    return this.effects.get(effectKey);
  }

  /**
   * ******************** Injected into ********************
   */
  addInjectedInto({ propertyKey, store }: StoreInjectedInto) {
    if (!this.injectedIntos.has(store.id)) {
      this.injectedIntos.set(store.id, { store, propertyKey });
    }
  }
}

interface Effect {
  deps: string[];
  depsValues: any[];
  isCalledOnce: boolean;
  clearEffect?: (() => void) | null;
}

interface StoreConsumer {
  render: () => void;
}

interface StoreInjectedInto {
  store: Store;
  propertyKey: PropertyKey;
}
