import { StorePartStore } from "./storePart.store";
import { connect, useStore } from "@react-store/core";
import React from "react";

export const StorePartTest = connect(function App() {
  const st = useStore(StorePartStore);
  return (
    <>
      {JSON.stringify(st.validator)}
      <button onClick={st.resetStorePart}>override</button>
    </>
  );
}, StorePartStore);
