import { isStorePart } from "src/decorators/storePart";
import adtProxyBuilder from "src/proxy/adtProxy/adtProxyBuilder";
import { getType } from "src/utils/utils";
import { STORE_ADMINISTRATION } from "../../constant";
import { EffectsContainer } from "../handlers/effects/effectContainer";
import ServiceInfo from "../handlers/effects/storePartInfo";

export class StoreAdministration extends EffectsContainer {
  id: string;

  type: Function;

  pureInstance: any;

  instance: any;

  instancePropsValue = new Map<PropertyKey, any>();

  consumers: StoreConsumer[] = [];

  servicesInfo = new Map<PropertyKey, ServiceInfo>();

  private injectedIntos = new Map<string, StoreInjectedInto>();

  private isRenderAllow = true;

  init({ id, instance }: { id: string; instance: object }) {
    this.id = id;
    this.type = getType(instance)!;
    this.pureInstance = instance;
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
    Object.entries<any>(this.pureInstance).map(([propertyKey, value]) => {
      if (
        value &&
        isStorePart(value.constructor) &&
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
      this.injectedIntos.forEach(({ storeAdministration }) =>
        storeAdministration.renderConsumers()
      );
    }
  }

  /**
   * ***************s***** Injected into ********************
   */
  addInjectedInto({ propertyKey, storeAdministration }: StoreInjectedInto) {
    if (!this.injectedIntos.has(storeAdministration.id)) {
      this.injectedIntos.set(storeAdministration.id, {
        storeAdministration,
        propertyKey,
      });
    }
  }
}

interface StoreConsumer {
  render: () => void;
}

interface StoreInjectedInto {
  storeAdministration: StoreAdministration;
  propertyKey: PropertyKey;
}
