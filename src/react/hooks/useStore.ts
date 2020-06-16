import { useContext } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import ReactAppContext from "../appContext";

const appContext = getFromContainer(ReactAppContext);

const useStore = <T extends ClassType = any>(storeType: T): InstanceType<T> => {
  let storeInstance: InstanceType<T>;

  // check if it has context pointer
  const storeContext = appContext.findStoreContext(storeType);

  if (storeContext) {
    const context = useContext(storeContext.context);
    storeInstance = context.storeInstance;
  } else {
    // TODO
    // globals
    storeInstance = {} as any;
  }
  return storeInstance;
};
export default useStore;
