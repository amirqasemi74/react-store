import React from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import ReactAppContext from "../appContext";
import buildProviderComponent from "./buildProviderComponent";

const connectToStore = <T extends object>(
  Component: React.FC<T>,
  storeType: ClassType
): React.FC<T> => {
  const storeContext = getFromContainer(ReactAppContext).findStoreContext(
    storeType
  );

  if (!storeContext) {
    throw new Error(
      `${storeType.name} doesn't decorated with @ContextStore/@GlobalStore`
    );
  }

  const ContextProvider = buildProviderComponent(
    storeContext.context,
    storeType
  );

  return (props: any) => {
    return (
      <ContextProvider props={props}>
        <Component {...props} />
      </ContextProvider>
    );
  };
};
export default connectToStore;
