import React, { useState } from "react";
import ToDos from "./toDos/ToDos";
import { connectStore, StoreProvider, useStore } from "@react-store/core";
import ThemeStore from "./theme.store";
import { ToDoStore } from "./toDos/toDo.store";
import { PureToDosProvider } from "./todos-pure/PureToDosProvider";
import { PureToDos } from "./todos-pure/PureToDos";

const App = () => {
  const vm = useStore(ThemeStore);
  return (
    <>
      <button onClick={vm.changePrimary}>change theme</button>
      <StoreProvider type={ToDoStore} render={ToDos} />
      {/* <PureToDosProvider>
        <PureToDos />
      </PureToDosProvider> */}
    </>
  );
};

export default connectStore(App, ThemeStore);
