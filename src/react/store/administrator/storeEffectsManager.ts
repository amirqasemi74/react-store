import { StoreEffectsMetadataUtils } from "src/decorators/effect";
import type { StoreAdministrator } from "./storeAdministrator";

export class StoreEffectsManager {
  private effects = new Map<PropertyKey, Effect>();

  constructor(private storeAdmin: StoreAdministrator) {}

  get effectsMetaData() {
    return StoreEffectsMetadataUtils.get(this.storeAdmin.type);
  }

  storeEffect(effectKey: PropertyKey, effect: Effect) {
    this.effects.set(effectKey, effect);
  }

  getEffect(effectKey: PropertyKey) {
    return this.effects.get(effectKey);
  }
}
interface Effect {
  clearEffect?: (() => void) | null;
}
