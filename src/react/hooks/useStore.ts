import { useContext, useEffect, useRef, useState } from "react";
import { getFromContainer } from "src/container";
import adtProxyBuilder from "src/proxy/adtProxy";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import ReactAppContext from "../appContext";
import Store from "../store";
import useLazyRef from "src/utils/useLazyRef";

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

  /**
   * the store instance which useStore returns must be always the pure instance of
   * store.
   * - if we return store.instance, it's a proxy which change it's reference in every render
   *   so developer can't use store properties in useEffect or ... for dependencies
   * - if we return store.pureInstace, reference is okay but stores methods is auto binded.
   * - SO HERE we proxy ONLY store properties not deep for properties value and for methods
   *   we bind store.instance to render for store state changes
   */
  return useLazyRef(() =>
    adtProxyBuilder({
      store: store!,
      value: store!.pureInstance,
      fixdeFuncContext: store!.instance,
      proxyTypes: ["Function"],
    })
  ).current;
};

export default useStore;
