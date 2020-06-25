import React from "react";
import { getFromContainer } from "src/container";
import ReactAppContext from "src/react/appContext";
import { ClassType } from "src/types";
import Store from "src/react/store";

export default function ContextStore(): ClassDecorator {
  return function (target: Function) {
    const TheContext = React.createContext<Store | null>(null);
    TheContext.displayName = `${target.name}`;

    // store context provider in app container
    // to use context ref in useStore to get context value
    getFromContainer(ReactAppContext).registerStoreContext({
      storeType: target as ClassType,
      context: TheContext,
    });
  };
}
