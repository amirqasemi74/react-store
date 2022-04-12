import { ComputedStore, UpperComputedStore } from "./computed.store";
import { connect, useStore } from "@react-store/core";
import React from "react";

export const Computed = connect(
  connect(() => {
    const st = useStore(ComputedStore);
    return (
      <>
        <p>Array Length: {st.arrLen}</p>
        <button onClick={st.changeArray}>Change Array</button>
        {/* <p>Object String: {st.upper.objStr}</p> */}
        <button onClick={st.upper.changeObj}>Change Object</button>
        <p>Store Part Object Array Length: {st.partObjArrLen}</p>
      </>
    );
  }, ComputedStore),
  UpperComputedStore
);
