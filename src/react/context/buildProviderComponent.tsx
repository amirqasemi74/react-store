import React, { Context, useEffect, useRef, useState } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import ReactAppContext from "../appContext";
import registerHandlers from "../handlers";
import storeInjectionHandler from "../handlers/storeInjectionHandler";
import Store from "../store";

interface ProviderComponentProps {
  props?: any;
}

const appContext = getFromContainer(ReactAppContext);

const buildProviderComponent = (
  TheContext: Context<Store | null>,
  StoreType: ClassType
): React.FC<ProviderComponentProps> => ({ children, props }) => {
  const [, setRenderKey] = useState(uid());

  const id = useRef(uid()).current;

  const store = useRef(
    appContext.resolveStore({
      StoreType,
      id,
      type: "context",
      storeDeps: storeInjectionHandler(StoreType),
    })
  ).current;

  useEffect(() => {
    store.consumers.push({ render: () => setRenderKey(uid()) });
  }, []);

  registerHandlers(store, props);

  return <TheContext.Provider value={store}>{children}</TheContext.Provider>;
};

export default buildProviderComponent;
