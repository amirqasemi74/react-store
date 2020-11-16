import { useContext, useEffect, useState } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import ReactAppContext from "../appContext";
import StoreAdministration from "../storeAdministration";

export interface ComponentDeps {
  paths: string[];
  status: "RESOLVED" | "UNRESOLVED";
}

const useStore = <T extends ClassType = any>(storeType: T): InstanceType<T> => {
  let storeAdministration: StoreAdministration | null = null;
  const [, setRenderKey] = useState(uid());
  const appContext = getFromContainer(ReactAppContext);

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
      const render = () => setRenderKey(uid());
      storeAdministration?.consumers.push({ render });

      return () => {
        if (storeAdministration) {
          storeAdministration.consumers = storeAdministration.consumers.filter(
            (cnsr) => cnsr.render !== render
          );
        }
      };
    }, []);
  } else {
    // TODO
    // globals
  }

  if (!storeAdministration?.instance) {
    throw new Error(
      `${storeType.name} doesn't decorated with @ContextStore/@GlobalStore`
    );
  }

  return storeAdministration.instance;
};

export default useStore;
