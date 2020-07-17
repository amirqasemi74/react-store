import React from "react";
import { getFromContainer } from "src/container";
import ReactAppContext from "src/react/appContext";
import { ClassType } from "src/types";
import Store from "src/react/store";

export default function ContextStore(): ClassDecorator {
  return function (storeType: Function) {
    const context = React.createContext<Store | null>(null);
    context.displayName = `${storeType.name}`;

    // store context provider in app container
    // to use context ref in useStore to get context value
    getFromContainer(ReactAppContext).registerStoreContext(storeType, context);
  };
}
