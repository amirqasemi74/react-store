import React from "react";
import { getFromContainer } from "src/container/container";
import { ClassType } from "src/types";
import { useLazyRef } from "src/utils/useLazyRef";
import { ReactApplicationContext } from "../appContext";
import { buildStoreContextProvider } from "./buildStoreContextProvider";

interface Props {
  props?: any;
  type: ClassType;
}

export const StoreProvider: React.FC<Props> = ({ type, children, props }) => {
  const storeContext = useLazyRef(() =>
    getFromContainer(ReactApplicationContext).getStoreReactContext(type)
  ).current;

  if (!storeContext) {
    throw new Error(`${type.name} doesn't decorated with @Store`);
  }

  const StoreContextProvider = useLazyRef(() =>
    buildStoreContextProvider(storeContext, type)
  ).current;

  return <StoreContextProvider props={props}>{children}</StoreContextProvider>;
};
