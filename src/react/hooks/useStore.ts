import { ReactApplicationContext } from "../appContext";
import { StoreAdministrator } from "../store/administrator/storeAdministrator";
import { StoreFactory } from "../store/storeFactory";
import cloneDeep from "clone-deep";
import { dequal } from "dequal";
import { useContext, useRef } from "react";
import { getFromContainer } from "src/container/container";
import { ClassType } from "src/types";
import { useForceUpdate } from "src/utils/useForceUpdate";
import { useWillMount } from "src/utils/useWillMount";

export const useStore = <T extends ClassType = any>(
  storeType: T,
  opts?: UseStoreOptsArg<T>
): InstanceType<T> => {
  const options = getUseStoreOptions(opts);
  const storeContext = getFromContainer(
    ReactApplicationContext
  ).getStoreReactContext(storeType);

  if (!storeContext) {
    throw new Error(
      `${storeType.name} haven't been connected to the component tree!`
    );
  }
  const storeAdmin = useContext(storeContext)!;

  registerAsConsumer(storeAdmin, options);

  return storeAdmin.instanceForComponents;
};

interface UseStoreOptions<T extends ClassType> {
  deps?: (vm: InstanceType<T>) => any[];
  props?: any;
}

type UseStoreOptsArg<T extends ClassType> =
  | UseStoreOptions<T>
  | UseStoreOptions<T>["deps"];

const registerAsConsumer = <T extends ClassType = any>(
  storeAdmin: StoreAdministrator,
  options: UseStoreOptions<T>
) => {
  const isUnMounted = useRef(false);
  const forceUpdate = useForceUpdate();
  const componentDeps = useRef<any[]>([]);

  useWillMount(() => {
    const render = () => {
      if (isUnMounted.current) return;

      if (options.deps) {
        const currentDeps = cloneDeep(
          options.deps(storeAdmin.instanceForComponents)
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
    storeAdmin.consumers.add(render);

    return () => {
      isUnMounted.current = true;
      storeAdmin.consumers.delete(render);
    };
  });

  componentDeps.current =
    cloneDeep(options.deps?.(storeAdmin.instanceForComponents)) ||
    componentDeps.current;
};

const getUseStoreOptions = <T extends ClassType>(
  opts: UseStoreOptsArg<T>
): UseStoreOptions<T> => (typeof opts === "function" ? { deps: opts } : opts || {});
