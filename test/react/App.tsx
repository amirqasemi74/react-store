import React, { useState } from "react";
import DashboardStore from "./pages/dashboard.store";
import ThemeProvider from "./context/ThemeProvider";
import { conntectToStore } from "react-over";
import UserPage from "./pages/user";

const App = () => {
  const [isShow, setIsShow] = useState(true);
  return (
    <ThemeProvider>
      <button onClick={() => setIsShow((pre) => !pre)}>Toggle</button>
      <section style={{ display: "flex", justifyContent: "space-evenly" }}>
        {isShow && (
          <>
            <UserPage username="amir.qasemi74" />
            <UserPage username="sahar.jahtalab" />
          </>
        )}
      </section>
    </ThemeProvider>
  );
};

export default conntectToStore(App, DashboardStore);
