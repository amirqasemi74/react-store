import { AccessedPath } from "./propertyKeys/storePropertyKeysManager";
import type { StoreAdministrator } from "./storeAdministrator";
import cloneDeep from "clone-deep";
import { dequal } from "dequal";
import isPromise from "is-promise";
import lodashGet from "lodash/get";
import { useEffect, useRef } from "react";
import {
  AutoEffectOptions,
  EffectsMetadataUtils,
  ManualEffectOptions,
} from "src/decorators/effect";
import { Func } from "src/types";
import { GetSetPaths } from "src/utils/getSetPathsCalculator";

export class StoreEffectsManager {
  readonly effects = new Map<
    PropertyKey,
    { deps: AccessedPath[]; clear?: Func<void> }
  >();

  constructor(private storeAdmin: StoreAdministrator) {}

  registerEffects() {
    this.effectsMetaData.forEach((e) =>
      this.effects.set(e.propertyKey, { deps: [] })
    );

    this.effectsMetaData.forEach((metadata) => {
      const handler = metadata.options.auto
        ? this.autoEffectHandler
        : this.manualEffectHandler;
      this.storeAdmin.hooksManager.reactHooks.add({
        when: "AFTER_INSTANCE",
        hook: () => {
          handler.call(
            this,
            this.storeAdmin,
            metadata as ManualEffectOptions & AutoEffectOptions
          );
        },
      });
    });
  }

  private autoEffectHandler(
    storeAdmin: StoreAdministrator,
    {
      propertyKey: effectKey,
      options,
    }: { options: AutoEffectOptions; propertyKey: PropertyKey }
  ) {
    const { effectsManager, instanceForComponents, propertyKeysManager } =
      storeAdmin;

    const signal = useRef(0);
    const preDepsValue = useRef<unknown[]>();
    const isEqual = options.deepEqual ? dequal : Object.is;
    const depsValue = effectsManager.effects
      .get(effectKey)!
      .deps.map((path) => lodashGet(instanceForComponents, path));

    if (depsValue.some((v, i) => !isEqual(v, preDepsValue.current?.[i]))) {
      signal.current++;
    }

    useEffect(() => {
      propertyKeysManager.clearAccessedProperties();

      this.runEffect(effectKey, storeAdmin);

      const depPaths = this.calcDepPaths(propertyKeysManager.calcPaths());
      effectsManager.setEffectDeps(effectKey, depPaths);
      preDepsValue.current = depPaths.map((p) =>
        lodashGet(instanceForComponents, p)
      );
      if (options.deepEqual) {
        preDepsValue.current = cloneDeep(preDepsValue.current, true);
      }

      return () => effectsManager.getClearEffect(effectKey)?.();
    }, [signal.current]);
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
        if (!options.auto) {
          preDepsValue.current = options.deepEqual
            ? cloneDeep(depsValue, true)
            : depsValue;
        }
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

  private calcDepPaths(getSetPaths: GetSetPaths) {
    const checkIfIsSetBefore = (getPath: AccessedPath, index: number) =>
      getSetPaths
        .filter((p, i) => i < index && p.type === "SET")
        .some(
          (p) =>
            p.path.length <= getPath.length &&
            p.path.every((_p, i) => getPath[i] === _p)
        );

    return getSetPaths
      .filter((gsp, i) => gsp.type === "GET" && !checkIfIsSetBefore(gsp.path, i))
      .map(({ path }) => path)
      .filter(
        (path, i, paths) =>
          paths.findIndex((_path) => path.every((p, j) => _path[j] === p)) === i
      );
  }

  private runEffect(effectKey: PropertyKey, storeAdmin: StoreAdministrator) {
    // Run Effect
    const clearEffect: Func<void> | undefined =
      storeAdmin.instanceForComponents[effectKey]?.();

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

  setEffectDeps(effectKey: PropertyKey, deps: AccessedPath[]) {
    const info = this.effects.get(effectKey);
    if (info) info.deps = deps;
  }

  getEffectDeps(effectKey: PropertyKey) {
    return this.effects.get(effectKey)?.deps;
  }
}
