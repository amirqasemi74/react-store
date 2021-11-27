import React, { useMemo } from "react";
import { getFromContainer } from "src/container/container";
import { ClassType } from "src/types";
import { useLazyRef } from "src/utils/useLazyRef";
import { ReactApplicationContext } from "../appContext";
import { StoreContextProviderFactory } from "./storeContextProviderFactory";

interface Props {
  props?: any;
  type: ClassType;
  render: React.FC<any>;
}

export const StoreProvider = ({ type, render, props }: Props) => {
  const storeContext = useLazyRef(() =>
    getFromContainer(ReactApplicationContext).getStoreReactContext(type)
  ).current;

  if (!storeContext) {
    throw new Error(`${type.name} doesn't decorated with @Store`);
  }

  const StoreContextProvider = useLazyRef(() =>
    StoreContextProviderFactory.create(storeContext, type)
  ).current;

  const Component = useMemo(() => React.memo(render), []);

  return (
    <StoreContextProvider props={props}>
      <Component />
    </StoreContextProvider>
  );
};
