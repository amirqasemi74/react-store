import { useContext, useEffect, useRef, useState } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import ReactAppContext from "../appContext";
import ComponentDepsDetector from "../setGetPathDetector/componentDepsDetector";
import Store from "../store";

export interface ComponentDeps {
  paths: string[];
  status: "RESOLVED" | "UNRESOLVED";
}

const useStore = <T extends ClassType = any>(storeType: T): InstanceType<T> => {
  const componentDepsDetector = getFromContainer(ComponentDepsDetector);
  const appContext = getFromContainer(ReactAppContext);
  let store: Store | null = null;
  const [, setRenderKey] = useState(uid());
  const deps = useRef<ComponentDeps>({
    status: "UNRESOLVED",
    paths: [],
  });

  // check if it has context pointer
  const storeContext = appContext.findStoreContext(storeType);

  if (storeContext) {
    store = useContext(storeContext);
    if (!store) {
      throw new Error(
        `${storeType.name} haven't been connected to the component tree!`
      );
    }

    useEffect(() => {
      const render = (setPaths: string[]) => {
        // console.log(setPaths, deps.current);

        loop1: for (const setPath of setPaths) {
          for (const dep of [...deps.current.paths]) {
            if (dep.includes(setPath)) {
              setRenderKey(uid());
              break loop1;
            }
          }
        }
      };

      if (store) {
        store.consumers.push({ render });
      }

      return () => {
        if (store) {
          store.consumers = store.consumers.filter(
            (cnsr) => cnsr.render !== render
          );
        }
      };
    }, []);
  } else {
    // TODO
    // globals
  }

  if (!store?.instance) {
    throw new Error(
      `${storeType.name} doesn't decorated with @ContextStore/@GlobalStore`
    );
  }

  componentDepsDetector.saveDepsForPreAndExtractDepsForNextComponent(
    store,
    deps
  );

  return store.instance;
};

export default useStore;
