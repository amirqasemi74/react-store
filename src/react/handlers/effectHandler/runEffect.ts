import isPromise from "is-promise";
import objectPath from "object-path";
import { getFromContainer } from "src/container";
import adtProxyBuilder from "src/observation/adtProxyBuilder";
import ReactAppContext from "src/react/appContext";
import Store from "src/react/store";
import dependecyExtarctor, {
  GetSetLog,
} from "../../../setGetPathDetector/dependencyExtractor";
import { depReturnValue } from "./dep";

const runEffect = (
  store: Store,
  effectKey: PropertyKey,
  depsValues?: any[]
) => {
  const appContext = getFromContainer(ReactAppContext);

  const getSetLogs: GetSetLog[] = [];
  const context = adtProxyBuilder({
    store,
    getSetLogs,
    value: store.pureInstance,
    allowRender: false,
  });
  const res = Reflect.apply(store.pureInstance[effectKey], context, []);
  if (isPromise(res)) {
    throw new Error("Async function for effect is invalid!");
  }
  if (res === depReturnValue) {
    getSetLogs.length = 0;
    appContext.currentRunningEffect.depsList?.();
  }
  const deps = dependecyExtarctor(getSetLogs, store);
  store.storeEffet(effectKey, {
    deps,
    depsValues:
      depsValues ||
      deps.map((path) => objectPath.get(store.pureInstance, path)),
    isCalledOnce: true,
    clearEffect:
      res === depReturnValue
        ? appContext.currentRunningEffect.clearEffect
        : res instanceof Function
        ? res
        : null,
  });
};

export default runEffect;
