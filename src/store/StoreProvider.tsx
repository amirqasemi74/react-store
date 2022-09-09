import { ReactStore } from "..";
import {
  ReactApplicationContext,
  StoreAdministratorReactContext,
} from "../appContext";
import { StoreFactory } from "./storeFactory";
import React, { useMemo, useRef } from "react";
import { StoreMetadataUtils } from "src/decorators/store";
import { ClassType } from "src/types";
import { useForceUpdate } from "src/utils/useForceUpdate";
import { useFixedLazyRef } from "src/utils/useLazyRef";

interface Props {
  props?: object;
  type: ClassType;
  render: React.FC;
}

export const StoreProvider = React.memo(({ type, render, props }: Props) => {
  const renderId = useRef(0);
  const isRenderRelax = useRef(true);
  const [forceRenderId, forceRenderContext] = useForceUpdate();
  const TheContext = useFixedLazyRef(() => {
    if (!StoreMetadataUtils.is(type)) {
      throw new Error(`\`${type.name}\` does not decorated with @Store()`);
    }

    const appContext = ReactStore.container.resolve(ReactApplicationContext);
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

  const renderContext = (relax?: boolean) => {
    isRenderRelax.current = !!relax;
    if (relax) {
      renderId.current++;
    } else {
      forceRenderContext();
    }
  };

  const storeAdmin = StoreFactory.create(type, renderContext, props);

  const Component = useMemo(() => React.memo(render), []);

  const value = useMemo(
    () => ({
      storeAdmin,
      id: isRenderRelax.current
        ? `relax-${renderId.current}`
        : `force-${forceRenderId}`,
    }),
    [renderId.current, forceRenderId, isRenderRelax.current]
  );

  return (
    <TheContext.Provider value={value}>
      <Component {...props} />
    </TheContext.Provider>
  );
});
