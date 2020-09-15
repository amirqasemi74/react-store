import { isService } from "src/decorators/service";
import adtProxyBuilder from "src/proxy/adtProxy";
import { getType } from "src/utils/utils";
import { STORE_REF } from "../constant";
import EffectsContainer from "./handlers/effectHandler/effectContainer";
import ServiceInfo from "./handlers/effectHandler/serviceInfo";

export default class Store extends EffectsContainer {
  id: string;

  constructorType: Function;

  pureInstance: any;

  instance: any;

  consumers: StoreConsumer[] = [];

  servicesInfo = new Map<PropertyKey, ServiceInfo>();

  private injectedIntos = new Map<string, StoreInjectedInto>();

  private isRenderAllow = true;

  constructor({ id, instance }: { id: string; instance: object }) {
    super();
    this.id = id;
    this.constructorType = getType(instance);
    this.pureInstance = instance;
    instance[STORE_REF] = this;
    this.instance = adtProxyBuilder({
      value: instance,
      onSet: this.renderConsumers.bind(this),
    });

    // to access store in deep proxy for effects handler
    this.turnOffRender();
    this.instance[STORE_REF] = this.pureInstance[STORE_REF] = this;
    this.initServiceEffectContainers();
    this.turnOnRender();
  }

  private initServiceEffectContainers() {
    Object.entries<any>(this.pureInstance).map(([propertyKey, value]) => {
      if (
        value &&
        isService(value.constructor) &&
        !this.servicesInfo.has(propertyKey)
      ) {
        this.servicesInfo.set(
          propertyKey,
          new ServiceInfo({
            pureContext: value,
            context: this.instance[propertyKey],
          })
        );
      }
    });
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
   * ***************s***** Injected into ********************
   */
  addInjectedInto({ propertyKey, store }: StoreInjectedInto) {
    if (!this.injectedIntos.has(store.id)) {
      this.injectedIntos.set(store.id, { store, propertyKey });
    }
  }
}

interface StoreConsumer {
  render: () => void;
}

interface StoreInjectedInto {
  store: Store;
  propertyKey: PropertyKey;
}
