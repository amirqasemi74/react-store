import React, { useState } from "react";
import { createStoreContext } from "react-vm";
import DashboardStore from "./pages/dashboard.store";
import UserPage from "./pages/user";
import ThemeProvider from "./context/ThemeProvider";

export default function App() {
  const [isShow, setIsShow] = useState(true);
  return (
    <ThemeProvider>
      <DashboardContext>
        <button onClick={() => setIsShow(pre => !pre)}>Toggle</button>
        <section style={{ display: "flex", justifyContent: "space-evenly" }}>
          {isShow && (
            <>
              <UserPage username="amir.qasemi74" />
              <UserPage username="sahar.jahtalab" />
            </>
          )}
        </section>
      </DashboardContext>
    </ThemeProvider>
  );
}

const DashboardContext = createStoreContext(DashboardStore);
