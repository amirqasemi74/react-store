import { getFromContainer } from "src/container";
import ReactAppContext from "src/react/appContext";

export const depReturnValue = Symbol("DEP_RETURN_VALUE");

export const dep = (deps?: () => any[], clearEffect?: () => void) => {
  const appContext = getFromContainer(ReactAppContext);

  appContext.currentRunningEffect = {
    depsList: deps,
    clearEffect,
  };
  return depReturnValue;
};

export default dep;
