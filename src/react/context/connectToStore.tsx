import React from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import uid from "src/utils/uid";
import ReactAppContext, { StoreContextValue } from "../appContext";
import buildProviderComponent from "./buildProviderComponent";

const appContext = getFromContainer(ReactAppContext);

const connectToStore = <T extends object>(
  Component: React.FC<T>,
  storeType: ClassType
): React.FC<T> => {
  const TheContext = React.createContext<StoreContextValue>({
    storeInstance: null,
    renderKey: uid(),
  });
  TheContext.displayName = `${storeType.name}`;
  const ContextProvider = buildProviderComponent(TheContext, storeType);

  // store context provider in app container
  // to use context ref in useStore to get context value
  appContext.registerStoreContext({ storeType, context: TheContext });

  return (props: any) => {
    return (
      <ContextProvider props={props}>
        <Component {...props} />
      </ContextProvider>
    );
  };
};
export default connectToStore;
