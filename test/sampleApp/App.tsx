import React from "react";
import ThemeProvider from "./ThemeProvider";
import ToDos from "./toDos";

const App = () => {
  return (
    <ThemeProvider>
      <ToDos />
    </ThemeProvider>
  );
};

export default App;
