import { AccessedPath } from "../propertyKeys/storePropertyKeysManager";
import cloneDeep from "clone-deep";
import { dequal } from "dequal";
import isPromise from "is-promise";
import lodashGet from "lodash/get";
import { useEffect, useRef } from "react";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";
import { Func } from "src/types";
import { GetSetPaths } from "src/utils/getSetPathsCalculator";

export const effectHandler = (storeAdmin: StoreAdministrator) => {
  storeAdmin.effectsManager.effectsMetaData.forEach(
    ({ propertyKey: effectKey, options }) => {
      const { effectsManager, instanceForComponents, propertyKeysManager } =
        storeAdmin;
      const depsValue = (
        options.auto
          ? (o: object) =>
              effectsManager.effects
                .get(effectKey)
                ?.deps?.map((path) => lodashGet(o, path))
          : options.deps
      )?.(instanceForComponents);

      const signal = useRef(0);
      const preDepsValue = useRef<unknown[]>();
      const isEqual = options.deepEqual ? dequal : Object.is;

      if (depsValue) {
        if (depsValue.some((v, i) => !isEqual(v, preDepsValue.current?.[i]))) {
          if (!options.auto) {
            preDepsValue.current = options.deepEqual
              ? cloneDeep(depsValue, true)
              : depsValue;
          }
          signal.current += 1;
        }
      } else {
        signal.current++;
      }

      useEffect(() => {
        if (options.auto) {
          propertyKeysManager.clearAccessedProperties();
        }

        runEffect(effectKey, storeAdmin);

        if (options.auto) {
          const depPaths = calcDepPaths(propertyKeysManager.calcPaths());
          effectsManager.setEffectDeps(effectKey, depPaths);
          preDepsValue.current = depPaths.map((p) =>
            lodashGet(instanceForComponents, p)
          );
        }
        return () => effectsManager.getClearEffect(effectKey)?.();
      }, [signal.current]);
    }
  );
};

const calcDepPaths = (getSetPaths: GetSetPaths) => {
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
};

const runEffect = (effectKey: PropertyKey, storeAdmin: StoreAdministrator) => {
  // Run Effect
  const clearEffect: Func<void> | undefined = Reflect.apply(
    storeAdmin.instanceForComponents[effectKey],
    storeAdmin.instanceForComponents,
    []
  );

  if (clearEffect && !isPromise(clearEffect) && typeof clearEffect === "function") {
    storeAdmin.effectsManager.setClearEffect(effectKey, clearEffect);
  }
};
