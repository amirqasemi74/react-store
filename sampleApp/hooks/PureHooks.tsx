import { useUsername } from "./useUsername";
import { createContext, useContext } from "react";
import React from "react";

const HooksContext = createContext<any>(null);

const HooksProvider: React.FC<any> = ({ children }) => {
  const username = useUsername("amir");
  return (
    <HooksContext.Provider value={{ username }}>{children}</HooksContext.Provider>
  );
};

const PureHooksConsumer = () => {
  const ct = useContext(HooksContext);
  return <>{ct.username}</>;
};

export const PureHooksTest = () => {
  return (
    <HooksProvider>
      <PureHooksConsumer />
    </HooksProvider>
  );
};
