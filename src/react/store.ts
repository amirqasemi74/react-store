import { observe } from "src/observability";
import { getType } from "src/utils/utils";
import { STORE_REF } from "./constant";

export default class Store {
  id?: string;

  type: Function;

  pureInstance: any;

  instance: any;

  consumers: StoreConsumer[] = [];

  private isRenderAllow = true;

  private effects = new Map<PropertyKey, Effect>();

  constructor({ id, instance }: Args) {
    this.id = id;
    this.type = getType(instance);
    this.pureInstance = instance;
    this.instance = observe(instance, this);
    // to access store in deep proxy for effects handler
    this.instance[STORE_REF] = this.pureInstance[STORE_REF] = this;
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
}

interface Args {
  id?: string;
  instance: object;
}

interface Effect {
  deps: string[];
  preDepsValues: any[];
  isCalledOnce: boolean;
}
interface StoreConsumer {
  render: Function;
}
