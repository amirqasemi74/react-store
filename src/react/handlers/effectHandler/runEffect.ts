import isPromise from "is-promise";
import objectPath from "object-path";
import { getFromContainer } from "src/container";
import adtProxyBuilder from "src/proxy/adtProxy";
import ReactAppContext from "src/react/appContext";
import dependencyExtarctor, {
  GetSetLog,
} from "src/setGetPathDetector/dependencyExtractor";
import { depReturnValue } from "./dep";
import EffectsContainer from "./effectContainer";

interface RunEffectArgs {
  container: EffectsContainer;
  context: object;
  pureContext: object;
  effectKey: PropertyKey;
  depsValues?: any[];
}

const runEffect = ({
  container,
  effectKey,
  context: _context,
  pureContext,
  depsValues,
}: RunEffectArgs) => {
  const appContext = getFromContainer(ReactAppContext);

  const getSetLogs: GetSetLog[] = [];
  const context = adtProxyBuilder({
    getSetLogs,
    value: _context,
    cacheProxied: false,
  });

  //run
  const res = Reflect.apply(pureContext[effectKey], context, []);

  if (isPromise(res)) {
    throw new Error("Async function for effect is invalid!");
  }

  // if effect return dep(...) fn
  if (res === depReturnValue) {
    getSetLogs.length = 0; //clear logs
    appContext.currentRunningEffect.depsList?.();
  }

  const deps = dependencyExtarctor(getSetLogs, pureContext);

  container.storeEffet(effectKey, {
    deps,
    depsValues:
      depsValues ||
      deps.map((path) => objectPath.withInheritedProps.get(pureContext, path)),
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
