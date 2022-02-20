import { AutoEffectStore } from "./autoEffect.store";
import { connect, useStore } from "@react-store/core";
import React from "react";

export const AutoEffectTest = connect(() => {
  useStore(AutoEffectStore);

  return <>Auto Effects</>;
}, AutoEffectStore);
