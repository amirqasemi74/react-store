import { useContext, useState, useEffect } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import ReactAppContext from "../appContext";
import uid from "src/utils/uid";

const appContext = getFromContainer(ReactAppContext);

const useStore = <T extends ClassType = any>(storeType: T): InstanceType<T> => {
  let storeInstance: InstanceType<T> | null = null;
  const [, setRenderKey] = useState(uid());

  // check if it has context pointer
  const storeContext = appContext.findStoreContext(storeType);

  if (storeContext) {
    const store = useContext(storeContext);
    if (!store) {
      throw new Error(
        `${storeType.name} haven't been connected to the component tree!`
      );
    }
    storeInstance = store.instance;

    useEffect(() => {
      const render = () => setRenderKey(uid());
      store.consumers.push({ render });

      return () => {
        store.consumers = store.consumers.filter(
          (cnsr) => cnsr.render !== render
        );
      };
    }, []);
  } else {
    // TODO
    // globals
  }

  if (!storeInstance) {
    throw new Error(
      `${storeType.name} doesn't decorated with @ContextStore/@GlobalStore`
    );
  }
  return storeInstance;
};
export default useStore;
