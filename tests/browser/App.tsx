import { AppStore } from "./app.store";
import { connect, useStore } from "@react-store/core";
import React from "react";

export const App = connect(() => {
  const st = useStore(AppStore);
  console.log("render", st.username);

  return <></>;
}, AppStore);
