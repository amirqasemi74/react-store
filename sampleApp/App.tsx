import ThemeStore from "./theme.store";
import ToDos from "./toDos/ToDos";
import { ToDoStore } from "./toDos/toDo.store";
import { PureToDos } from "./todos-pure/PureToDos";
import { PureToDosProvider } from "./todos-pure/PureToDosProvider";
import { StoreProvider, connect, useStore } from "@react-store/core";
import React, { useState } from "react";

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

export default connect(App, ThemeStore);
