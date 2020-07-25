import isPromise from "is-promise";
import objectPath from "object-path";
import { getFromContainer } from "src/container";
import ReactAppContext from "src/react/appContext";
import Store from "src/react/store";
import { depReturnValue } from "./dep";
import dependeciesExtarctor from "./dependenciesExtractor";
import proxyDeep from "./proxyDeep";

const appContext = getFromContainer(ReactAppContext);

export interface GetSetStack {
  type: "SET" | "GET";
  target: any;
  propertyKey: PropertyKey;
  value: any;
}

const runEffect = (
  store: Store,
  effectKey: PropertyKey,
  depsValues?: any[]
) => {
  const getSetStack: GetSetStack[] = [];
  const context = proxyDeep({
    store,
    getSetStack,
  });
  const res = Reflect.apply(store.pureInstance[effectKey], context, []);
  if (isPromise(res)) {
    throw new Error("Async function for effect is invalid!");
  }
  if (res === depReturnValue) {
    getSetStack.length = 0;
    appContext.currentRunningEffect.depsList();
  }
  const deps = dependeciesExtarctor(getSetStack, store);
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
