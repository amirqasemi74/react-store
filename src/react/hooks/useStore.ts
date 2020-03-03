import { useContext } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import useForceUpdate from "use-force-update";
import ReactAppContext from "../appContext";
import useUniqueID from "./useUniqueID";

const appContext = getFromContainer(ReactAppContext);

const useStore = <T extends ClassType = any>(storeType: T): InstanceType<T> => {
  let storeInstance: InstanceType<T>;
  const id = useUniqueID();

  // check if it has context pointer
  const storeContext = appContext.findStoreContext(storeType);

  if (storeContext) {
    storeInstance = useContext(storeContext.context);

    // if useStore ia used where StoreProvider has been mounted
    if (storeInstance === null) {
      const store = appContext.resolveStore({
        StoreType: storeContext.storeType,
        id,
        type: "context"
      });
      store.rerender = useForceUpdate();
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
