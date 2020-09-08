import { useContext, useEffect, useState } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import ReactAppContext from "../appContext";
import Store from "../store";

export interface ComponentDeps {
  paths: string[];
  status: "RESOLVED" | "UNRESOLVED";
}

const useStore = <T extends ClassType = any>(storeType: T): InstanceType<T> => {
  let store: Store | null = null;
  const [, setRenderKey] = useState(uid());
  const appContext = getFromContainer(ReactAppContext);

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
      const render = () => setRenderKey(uid());
      store?.consumers.push({ render });

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

  return store.instance;
};

export default useStore;
