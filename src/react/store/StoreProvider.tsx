import {
  ReactApplicationContext,
  StoreAdministratorReactContext,
} from "../appContext";
import { StoreFactory } from "./storeFactory";
import React, { useMemo, useRef } from "react";
import { getFromContainer } from "src/container/container";
import { StoreMetadataUtils } from "src/decorators/store";
import { ClassType } from "src/types";
import { useFixedLazyRef } from "src/utils/useLazyRef";

interface Props {
  props?: object;
  type: ClassType;
  render: React.FC;
}

export const StoreProvider = ({ type, render, props }: Props) => {
  const contextRenderId = useRef(0);
  const TheContext = useFixedLazyRef(() => {
    if (!StoreMetadataUtils.is(type)) {
      throw new Error(`\`${type.name}\` does not decorated with @Store()`);
    }

    const appContext = getFromContainer(ReactApplicationContext);
    let context = appContext.getStoreReactContext(type);
    if (!context) {
      context =
        React.createContext<React.ContextType<StoreAdministratorReactContext>>(null);
      context.displayName = `${type.name}`;
      // store context provider in app container
      // to use context ref in useStore to get context value
      appContext.registerStoreContext(type, context);
    }

    return context;
  });

  const storeAdmin = StoreFactory.create(type, contextRenderId, props);

  const Component = useMemo(() => React.memo(render), []);

  const value = useMemo(
    () => ({ storeAdmin, id: contextRenderId.current }),
    [storeAdmin, contextRenderId.current]
  );

  return (
    <TheContext.Provider value={value}>
      <Component {...props} />
    </TheContext.Provider>
  );
};
