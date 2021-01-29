import React from "react";
import { getFromContainer } from "src/container";
import { ClassType } from "src/types";
import useLazyRef from "src/utils/useLazyRef";
import { ReactApplicationContext } from "../appContext";
import { buildStoreContextProvider } from "./buildStoreContextProvider";

interface Props {
  type: ClassType;
  props?: any;
}
export const StoreProvider: React.FC<Props> = ({ type, children, props }) => {
  const storeContext = useLazyRef(() =>
    getFromContainer(ReactApplicationContext).findStoreContext(type)
  ).current;

  if (!storeContext) {
    throw new Error(`${type.name} doesn't decorated with @Store`);
  }

  const StoreContextProvider = useLazyRef(() =>
    buildStoreContextProvider(storeContext, type)
  ).current;

  return <StoreContextProvider props={props}>{children}</StoreContextProvider>;
};
