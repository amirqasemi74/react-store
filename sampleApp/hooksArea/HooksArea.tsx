import { HooksAreaStore } from "./hooksArea.store";
import { connect, useStore } from "@react-store/core";
import React from "react";

export const HooksAreaTest = connect(function App() {
  const st = useStore(HooksAreaStore);

  return (
    <>
      <p>xid:{st.xId}</p>
      <p>username: {st.username}</p>
    </>
  );
}, HooksAreaStore);
