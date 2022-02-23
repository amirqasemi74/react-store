import { PropsStore } from "./props.store";
import { connect, useStore } from "@react-store/core";
import React, { useEffect } from "react";

export const PropsTest: React.FC<{ obj: { a: number }; a: any }> = connect(() => {
  const st = useStore(PropsStore);

  useEffect(() => {
    st.a = 234;
    console.log("set");
  }, [st.props.a]);

  return <>{JSON.stringify(st.props)}</>;
}, PropsStore);
