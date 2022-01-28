import { ReactApplicationContext } from "../appContext";
import { StoreAdministrator } from "./administrator/storeAdministrator";
import { StoreFactory } from "./storeFactory";
import React, { useMemo } from "react";
import { getFromContainer } from "src/container/container";
import { StoreMetadataUtils } from "src/decorators/store";
import { ClassType } from "src/types";
import { useFixedLazyRef } from "src/utils/useLazyRef";

interface Props {
  props?: any;
  type: ClassType;
  render: React.FC<any>;
}

export const StoreProvider = ({ type, render, props }: Props) => {
  const TheContext = useFixedLazyRef(() => {
    if (!StoreMetadataUtils.is(type)) {
      throw new Error(`\`${type.name}\` does not decorated with @Store()`);
    }

    const appContext = getFromContainer(ReactApplicationContext);
    let context = appContext.getStoreReactContext(type);
    if (!context) {
      context = React.createContext<StoreAdministrator | null>(null);
      context.displayName = `${type.name}`;
      // store context provider in app container
      // to use context ref in useStore to get context value
      appContext.registerStoreContext(type, context);
    }

    return context;
  });

  const storeAdmin = StoreFactory.create(type, props);

  const Component = useMemo(() => React.memo(render), []);

  return (
    <TheContext.Provider value={storeAdmin}>
      <Component {...props} />
    </TheContext.Provider>
  );
};
