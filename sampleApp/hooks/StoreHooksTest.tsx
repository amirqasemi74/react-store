import { HooksStore } from "./hooks.store";
import { connect, useStore } from "@react-store/core";
import React from "react";

export const StoreHooksTest = connect(
  React.memo(function App() {
    const st = useStore(HooksStore);

    return (
      <>
        <p>xid:{st.xId}</p>
        <p>username: {st.username}</p>
      </>
    );
  }),
  HooksStore
);
