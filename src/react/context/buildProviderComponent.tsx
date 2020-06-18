import React, { Context, useEffect, useRef, useState } from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import ReactAppContext, { StoreContextValue } from "../appContext";
import {
  getUsedContextes,
  setUsedContextesToInstance,
} from "../handlers/contextHandler";
import didMountHandler from "../handlers/didMountHandler";
import propsHandler from "../handlers/propsHandler";

interface ProviderComponentProps {
  props?: any;
}

const appContext = getFromContainer(ReactAppContext);

const buildProviderComponent = (
  TheContext: Context<StoreContextValue>,
  StoreType: ClassType
): React.FC<ProviderComponentProps> => ({ children, props }) => {
  const id = useRef<string>(uid());
  const store = useRef(
    appContext.resolveStore({
      StoreType,
      id: id.current,
      type: "context",
    })
  ).current;
  const [renderKey, setRenderKey] = useState(uid());
  const contextes = getUsedContextes(StoreType);

  setUsedContextesToInstance(store, contextes);

  propsHandler(props, store);

  didMountHandler(store);

  useEffect(() => {
    store.consumers.push({
      render: () => {
        setRenderKey(uid());
      },
    });
  }, []);
  return (
    <TheContext.Provider value={{ storeInstance: store.instance, renderKey }}>
      {children}
    </TheContext.Provider>
  );
};

export default buildProviderComponent;
