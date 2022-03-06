import { StorePartStore, UpperStore } from "./storePart.store";
import { connect, useStore } from "@react-store/core";
import React from "react";

export const StorePartTest = connect(
  connect(function App() {
    const st = useStore(StorePartStore);
    console.log(st);

    return (
      <>
        {st.isShow ? st.objab : "hide"}
        {/* {JSON.stringify(st.validator)} */}
        <button onClick={st.show}>override</button>
      </>
    );
  }, StorePartStore),
  UpperStore
);
