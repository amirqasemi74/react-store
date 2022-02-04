import { effectHandler } from "./handlers/effectHandler";
import type { StoreAdministrator } from "./storeAdministrator";
import React from "react";
import { EffectsMetadataUtils } from "src/decorators/effect";

export class StoreEffectsManager {
  private clearEffects = new Map<PropertyKey, ReturnType<React.EffectCallback>>();

  constructor(private storeAdmin: StoreAdministrator) {}

  registerEffects() {
    this.storeAdmin.reactHooks.add({
      hook: effectHandler,
      when: "AFTER_INSTANCE",
    });
  }

  get effectsMetaData() {
    return EffectsMetadataUtils.get(this.storeAdmin.type);
  }

  setClearEffect(effectKey: PropertyKey, clear: ReturnType<React.EffectCallback>) {
    this.clearEffects.set(effectKey, clear);
  }

  getClearEffect(effectKey: PropertyKey): ReturnType<React.EffectCallback> {
    return this.clearEffects.get(effectKey);
  }
}
