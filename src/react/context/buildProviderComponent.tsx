import React, { Context, useEffect, useRef } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import useForceUpdate from "use-force-update";
import ReactAppContext from "../appContext";
import Store from "../store";
import {
  getUsedContextes,
  setUsedContextesToInstance
} from "../handlers/contextHandler";
import didMountHandler from "../handlers/didMountHandler";
import propsHandler from "../handlers/propsHandler";

interface ProviderComponentProps {
  props?: any;
}

const appContext = getFromContainer(ReactAppContext);

const buildProviderComponent = <T extends any>(
  TheContext: Context<T>,
  StoreType: ClassType
): React.FC<ProviderComponentProps> => ({ children, props }) => {
  let store: Store;
  const id = useRef<string>(uid());
  const forceUpdate = useForceUpdate();
  const contextes = getUsedContextes(StoreType);

  /**
   * This component will be used in context component provider.
   * In the parent we may use useContext before initing the
   * provider and for corrent way of using it expect to have value
   * even though Provider mounted later.
   * For this perpose if in context parent we used useCotext
   * we make an instance and then assing it to provider component
   */

  if (appContext.hasAnyLastContextualStore) {
    const lastStore = appContext.resolveLastContextualStore();
    id.current = lastStore!.id!;
    if (lastStore!.type === StoreType) {
      store = lastStore!;
    } else {
      store = appContext.resolveStore({
        StoreType,
        id: id.current,
        type: "context"
      });
    }
  } else {
    store = appContext.resolveStore({
      StoreType,
      id: id.current,
      type: "context"
    });
  }

  setUsedContextesToInstance(store, contextes);

  propsHandler(props, store);

  didMountHandler(store);

  useEffect(() => {
    store.consumers.push({ forceUpdate });
  }, [forceUpdate]);

  return (
    <TheContext.Provider value={(store.instance as unknown) as T}>
      {children}
    </TheContext.Provider>
  );
};

export default buildProviderComponent;
