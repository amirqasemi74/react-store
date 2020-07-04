import React, { Context, useEffect, useRef, useState } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import ReactAppContext from "../appContext";
import { setUsedContextesToInstance } from "../handlers/contextHandler";
import didMountHandler from "../handlers/didMountHandler";
import propsHandler from "../handlers/propsHandler";
import Store from "../store";
import storeInjectionHandler from "../handlers/storeInjectionHandler";
import effectHandler from "../handlers/effectHandler";

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

  setUsedContextesToInstance(store);

  propsHandler(props, store);

  didMountHandler(store);

  effectHandler(store);

  return <TheContext.Provider value={store}>{children}</TheContext.Provider>;
};

export default buildProviderComponent;
