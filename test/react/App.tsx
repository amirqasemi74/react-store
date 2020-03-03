import React, { useState } from "react";
import { createStoreContext } from "react-vm";
import DashboardStore from "./pages/dashboard.store";
import UserPage from "./pages/user";

const DashboardContext = createStoreContext(DashboardStore);

export default function App() {
  const [isShow, setIsShow] = useState(true);
  return (
    <DashboardContext>
      <button onClick={() => setIsShow(pre => !pre)}>Toggle</button>
      {isShow && <UserPage username="amir.qasemi74" />}
      {isShow && <UserPage username="qasemi74" />}
    </DashboardContext>
  );
}
