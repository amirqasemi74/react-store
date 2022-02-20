import { effectHandler } from "./handlers/effectHandler";
import { AccessedPath } from "./propertyKeys/storePropertyKeysManager";
import type { StoreAdministrator } from "./storeAdministrator";
import { EffectsMetadataUtils } from "src/decorators/effect";
import { Func } from "src/types";

export class StoreEffectsManager {
  readonly effects = new Map<
    PropertyKey,
    { deps?: AccessedPath[]; clear?: Func<void> }
  >();

  constructor(private storeAdmin: StoreAdministrator) {}

  registerEffects() {
    this.effectsMetaData.forEach((e) => this.effects.set(e.propertyKey, {}));
    this.storeAdmin.reactHooks.add({
      hook: effectHandler,
      when: "AFTER_INSTANCE",
    });
  }

  get effectsMetaData() {
    return EffectsMetadataUtils.get(this.storeAdmin.type);
  }

  setClearEffect(effectKey: PropertyKey, clear: Func<void>) {
    const info = this.effects.get(effectKey);
    if (info) info.clear = clear;
  }

  getClearEffect(effectKey: PropertyKey) {
    return this.effects.get(effectKey)?.clear;
  }

  setEffectDeps(effectKey: PropertyKey, deps: AccessedPath[]) {
    const info = this.effects.get(effectKey);
    if (info) info.deps = deps;
  }

  getEffectDeps(effectKey: PropertyKey) {
    return this.effects.get(effectKey)?.deps;
  }
}
