import { useContext, useEffect, useRef, useState } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import { ReactApplicationContext } from "../appContext";
import StoreAdministration from "../store/storeAdministration";
import { dequal } from "dequal";
import cloneDeep from "clone-deep";

interface UseStoreOptions<T extends ClassType> {
  deps?: (vm: InstanceType<T>) => any[];
}

type UserStoreOptsArg<T extends ClassType> =
  | UseStoreOptions<T>
  | UseStoreOptions<T>["deps"];

const useStore = <T extends ClassType = any>(
  storeType: T,
  opts?: UserStoreOptsArg<T>
): InstanceType<T> => {
  const componentDeps = useRef<any[]>([]);
  const options = getUseStoreOptions(opts);
  const [, setRenderKey] = useState(uid());
  let storeAdministration: StoreAdministration | null = null;
  const appContext = getFromContainer(ReactApplicationContext);

  // check if it has context pointer
  const storeAdministrationContext = appContext.findStoreContext(storeType);

  if (storeAdministrationContext) {
    storeAdministration = useContext(storeAdministrationContext);
    if (!storeAdministration) {
      throw new Error(
        `${storeType.name} haven't been connected to the component tree!`
      );
    }

    useEffect(() => {
      const render = () => {
        if (options.deps) {
          const currentDeps = cloneDeep(
            options?.deps(storeAdministration?.instance)
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
            setRenderKey(uid());
          }
        } else {
          setRenderKey(uid());
        }
      };
      storeAdministration?.consumers.push({ render });

      return () => {
        if (storeAdministration) {
          storeAdministration.consumers = storeAdministration.consumers.filter(
            (cnsr) => cnsr.render !== render
          );
        }
      };
    }, []);
  }

  if (!storeAdministration?.instance) {
    throw new Error(
      `${storeType.name} doesn't decorated with @Store/@GlobalStore`
    );
  }
  componentDeps.current =
    cloneDeep(options.deps?.(storeAdministration.instance)) ||
    componentDeps.current;

  return storeAdministration.instance;
};

const getUseStoreOptions = <T extends ClassType>(
  opts: UserStoreOptsArg<T>
): UseStoreOptions<T> =>
  typeof opts === "function" ? { deps: opts } : opts || {};

export default useStore;
