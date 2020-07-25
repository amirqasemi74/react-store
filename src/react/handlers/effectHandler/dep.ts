import { getFromContainer } from "src/container";
import ReactAppContext from "src/react/appContext";

export const depReturnValue = Symbol("DEP_RETURN_VALUE");
const appContext = getFromContainer(ReactAppContext);

export const dep = (deps: () => any[], clearEffect: () => void) => {
  appContext.currentRunningEffect = {
    depsList: deps,
    clearEffect,
  };
  return depReturnValue;
};

export default dep;
