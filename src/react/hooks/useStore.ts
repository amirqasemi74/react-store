import { ReactApplicationContext } from "../appContext";
import { StoreAdministrator } from "../store/administrator/storeAdministrator";
import cloneDeep from "clone-deep";
import { dequal } from "dequal";
import { useContext, useRef } from "react";
import { getFromContainer } from "src/container/container";
import { ClassType } from "src/types";
import { useForceUpdate } from "src/utils/useForceUpdate";
import { useWillMount } from "src/utils/useWillMount";

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
  const isUnMounted = useRef(false);
  const forceUpdate = useForceUpdate();
  const componentDeps = useRef<any[]>([]);
  const options = getUseStoreOptions(opts);
  let storeAdministrator: StoreAdministrator | null = null;
  const appContext = getFromContainer(ReactApplicationContext);

  // check if it has context pointer
  const storeAdministratorContext = appContext.getStoreReactContext(storeType);
  if (!storeAdministratorContext) {
    throw new Error(
      `${storeType.name} haven't been connected to the component tree!`
    );
  }
  storeAdministrator = useContext(storeAdministratorContext)!;

  useWillMount(() => {
    const render = () => {
      if (isUnMounted.current) return;

      if (options.deps) {
        const currentDeps = cloneDeep(
          options.deps(storeAdministrator?.instanceForComponents)
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
    storeAdministrator?.consumers.add(render);

    return () => {
      isUnMounted.current = true;
      if (storeAdministrator) {
        storeAdministrator.consumers.delete(render);
      }
    };
  });

  componentDeps.current =
    cloneDeep(options.deps?.(storeAdministrator.instanceForComponents)) ||
    componentDeps.current;

  return storeAdministrator.instanceForComponents;
};

const getUseStoreOptions = <T extends ClassType>(
  opts: UseStoreOptsArg<T>
): UseStoreOptions<T> => (typeof opts === "function" ? { deps: opts } : opts || {});
