import isPromise from "is-promise";
import objectPath from "object-path";
import adtProxyBuilder from "src/proxy/adtProxy";
import dependencyExtarctor, {
  GetSetLog,
} from "src/setGetPathDetector/dependencyExtractor";
import { dep, DEP_RETURN_VALUE } from "./dep";
import { EffectsContainer } from "./effectContainer";

interface RunEffectArgs {
  context: object;
  pureContext: object;
  effectKey: PropertyKey;
  container: EffectsContainer;
}

type DepReturnType = ReturnType<typeof dep>;

export const runEffect = ({
  container,
  effectKey,
  pureContext,
  context: _context,
}: RunEffectArgs) => {
  const getSetLogs: GetSetLog[] = [];

  const context = adtProxyBuilder({
    getSetLogs,
    value: _context,
    cacheProxied: false,
  });

  //run ...
  const result:
    | DepReturnType
    | DepReturnType["clearEffect"]
    | undefined = Reflect.apply(pureContext[effectKey], context, []);

  if (isPromise(result)) {
    throw new Error("Async function for effect is invalid!");
  }

  let deps: DepReturnType["deps"];
  let clearEffect: DepReturnType["clearEffect"] | undefined;

  if (typeof result === "object" && result?.[DEP_RETURN_VALUE]) {
    deps = () => result.deps?.() || [];
    clearEffect = result.clearEffect;
  } else if (typeof result === "function" || !result) {
    const depsPath = dependencyExtarctor(getSetLogs, pureContext);
    deps = () =>
      depsPath.map((path) =>
        objectPath.withInheritedProps.get(pureContext, path)
      );
    clearEffect = result;
  }

  container.storeEffet(effectKey, {
    deps,
    clearEffect,
  });
};
