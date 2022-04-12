import ThemeStore from "./theme.store";
import ToDos from "./toDos/ToDos";
import { ToDoStore } from "./toDos/toDo.store";
import { StoreProvider, connect, useStore } from "@react-store/core";
import React from "react";

const App = () => {
  const vm = useStore(ThemeStore);
  return (
    <>
      <button onClick={vm.changePrimary}>change theme</button>
      <StoreProvider type={ToDoStore} render={ToDos} props={{ a: 1 }} />
    </>
  );
};

export default connect(App, ThemeStore);
