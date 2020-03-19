import { useContext, useEffect, useRef } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import useForceUpdate from "use-force-update";
import ReactAppContext from "../appContext";
import useUniqueID from "./useUniqueID";
import {} from "../constant";
import {
  getUsedContextes,
  setUsedContextesToInstance
} from "../handlers/contextHandler";

const appContext = getFromContainer(ReactAppContext);

const useStore = <T extends ClassType = any>(storeType: T): InstanceType<T> => {
  let storeInstance: InstanceType<T>;
  const id = useUniqueID();
  const forceUpdate = useForceUpdate();
  const contextes = getUsedContextes(storeType);

  // check if it has context pointer
  const storeContext = appContext.findStoreContext(storeType);

  if (storeContext) {
    storeInstance = useContext(storeContext.context);

    // if useStore is used where StoreProvider has been mounted
    if (storeInstance === null) {
      const store = appContext.resolveStore({
        StoreType: storeContext.storeType,
        id,
        type: "context"
      });

      useEffect(() => {
        store.consumers.push({ forceUpdate });
      }, [forceUpdate]);

      setUsedContextesToInstance(store, contextes);

      storeInstance = store.instance as InstanceType<T>;
    }
  } else {
    // TODO
    // globals
    storeInstance = {} as any;
  }

  return storeInstance;
};
export default useStore;
