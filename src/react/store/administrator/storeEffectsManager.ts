import type { StoreAdministrator } from "./storeAdministrator";
import { EffectsMetadataUtils } from "src/decorators/effect";

export class StoreEffectsManager {
  private clearEffects = new Map<PropertyKey, Function>();

  constructor(private storeAdmin: StoreAdministrator) {}

  get effectsMetaData() {
    return EffectsMetadataUtils.get(this.storeAdmin.type);
  }

  setClearEffect(effectKey: PropertyKey, clear: Function) {
    this.clearEffects.set(effectKey, clear);
  }

  getClearEffect(effectKey: PropertyKey) {
    return this.clearEffects.get(effectKey);
  }
}

interface Effect {
  clearEffect?: (() => void) | null;
}
