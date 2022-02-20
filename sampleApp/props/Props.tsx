import { PropsStore } from "./props.store";
import { connect, useStore } from "@react-store/core";
import React from "react";

export const PropsTest: React.FC<{ obj: { a: number }; a: any }> = connect(() => {
  const st = useStore(PropsStore);
  return <>{JSON.stringify(st.props)}</>;
}, PropsStore);
