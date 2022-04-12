import type { StoreAdministrator } from "./storeAdministrator";
import cloneDeep from "clone-deep";
import { dequal } from "dequal";
import isPromise from "is-promise";
import { useEffect, useRef } from "react";
import { EffectsMetadataUtils, ManualEffectOptions } from "src/decorators/effect";
import { Func } from "src/types";

export class StoreEffectsManager {
  readonly effects = new Map<PropertyKey, { clear?: Func<void> }>();

  constructor(private storeAdmin: StoreAdministrator) {}

  registerEffects() {
    this.effectsMetaData.forEach((e) => this.effects.set(e.propertyKey, {}));

    this.effectsMetaData.forEach((metadata) => {
      const handler = this.manualEffectHandler;
      this.storeAdmin.hooksManager.reactHooks.add({
        when: "AFTER_INSTANCE",
        hook: () => {
          handler.call(this, this.storeAdmin, metadata);
        },
      });
    });
  }

  private manualEffectHandler(
    storeAdmin: StoreAdministrator,
    {
      propertyKey: effectKey,
      options,
    }: { options: ManualEffectOptions; propertyKey: PropertyKey }
  ) {
    const { effectsManager, instanceForComponents } = storeAdmin;
    const signal = useRef(0);
    const preDepsValue = useRef<unknown[]>();
    const isEqual = options.deepEqual ? dequal : Object.is;
    const depsValue = options.deps?.(instanceForComponents);

    if (depsValue) {
      if (depsValue.some((v, i) => !isEqual(v, preDepsValue.current?.[i]))) {
        preDepsValue.current = options.deepEqual
          ? cloneDeep(depsValue, true)
          : depsValue;
        signal.current++;
      }
    } else {
      signal.current++;
    }

    useEffect(() => {
      this.runEffect(effectKey, storeAdmin);
      return () => effectsManager.getClearEffect(effectKey)?.();
    }, [signal.current]);
  }

  private runEffect(effectKey: PropertyKey, storeAdmin: StoreAdministrator) {
    // Run Effect
    const clearEffect: Func<void> | undefined = (
      storeAdmin.instanceForComponents[effectKey] as Func
    )?.apply(storeAdmin.instanceForComponents) as undefined;

    if (
      clearEffect &&
      !isPromise(clearEffect) &&
      typeof clearEffect === "function"
    ) {
      storeAdmin.effectsManager.setClearEffect(effectKey, clearEffect);
    }
  }

  get effectsMetaData() {
    // For overridden store methods we have two metadata
    // so we must filter duplicate ones
    return EffectsMetadataUtils.get(this.storeAdmin.type).filter(
      (v, i, data) => i === data.findIndex((vv) => vv.propertyKey === v.propertyKey)
    );
  }

  setClearEffect(effectKey: PropertyKey, clear: Func<void>) {
    const info = this.effects.get(effectKey);
    if (info) info.clear = clear;
  }

  getClearEffect(effectKey: PropertyKey) {
    return this.effects.get(effectKey)?.clear;
  }
}
