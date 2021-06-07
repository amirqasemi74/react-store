import cloneDeep from "clone-deep";
import { dequal } from "dequal";
import { useContext, useRef } from "react";
import { getFromContainer } from "src/container/container";
import { ClassType } from "src/types";
import { useForceUpdate } from "src/utils/useForceUpdate";
import { useSyncOnMount } from "src/utils/useSyncOnMount";
import { ReactApplicationContext } from "../appContext";
import { StoreAdministrator } from "../store/storeAdministrator";

interface UseStoreOptions<T extends ClassType> {
  deps?: (vm: InstanceType<T>) => any[];
}

type UseStoreOptsArg<T extends ClassType> =
  | UseStoreOptions<T>
  | UseStoreOptions<T>["deps"];

export const useStore = <T extends ClassType = any>(
  storeType: T,
  opts?: UseStoreOptsArg<T>
): InstanceType<T> => {
  const forceUpdate = useForceUpdate();
  const componentDeps = useRef<any[]>([]);
  const options = getUseStoreOptions(opts);
  let storeAdministrator: StoreAdministrator | null = null;
  const appContext = getFromContainer(ReactApplicationContext);

  // check if it has context pointer
  const storeAdministratorContext = appContext.getStoreReactContext(storeType);

  if (storeAdministratorContext) {
    storeAdministrator = useContext(storeAdministratorContext);
    if (!storeAdministrator) {
      throw new Error(
        `${storeType.name} haven't been connected to the component tree!`
      );
    }

    useSyncOnMount(() => {
      const render = () => {
        if (options.deps) {
          const currentDeps = cloneDeep(
            options.deps(storeAdministrator?.instance)
          );
          let changeDetected = false;
          for (const i in currentDeps) {
            const pre = componentDeps.current[i];
            const post = currentDeps[i];
            if (!dequal(pre, post)) {
              changeDetected = true;
              break;
            }
          }
          if (changeDetected) {
            forceUpdate();
          }
        } else {
          forceUpdate();
        }
      };
      storeAdministrator?.consumers.push(render);

      return () => {
        if (storeAdministrator) {
          storeAdministrator.consumers = storeAdministrator.consumers.filter(
            (rndr) => rndr !== render
          );
        }
      };
    });
  }

  if (!storeAdministrator?.instance) {
    throw new Error(
      `${storeType.name} doesn't decorated with @Store/@GlobalStore`
    );
  }
  componentDeps.current =
    cloneDeep(options.deps?.(storeAdministrator.instance)) ||
    componentDeps.current;

  return storeAdministrator.instance;
};

const getUseStoreOptions = <T extends ClassType>(
  opts: UseStoreOptsArg<T>
): UseStoreOptions<T> =>
  typeof opts === "function" ? { deps: opts } : opts || {};
