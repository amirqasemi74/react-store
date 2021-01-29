import isPromise from "is-promise";
import adtProxyBuilder from "src/proxy/adtProxy";
import { GetSetLog } from "src/setGetPathDetector/dependencyExtractor";
import { EffectsContainer } from "./effectContainer";

interface RunEffectArgs {
  context: object;
  pureContext: object;
  effectKey: PropertyKey;
  container: EffectsContainer;
}

type Func<T = void> = () => T;

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
  const clearEffect: Func | undefined = Reflect.apply(
    pureContext[effectKey],
    context,
    []
  );

  if (isPromise(clearEffect)) {
    throw new Error("Async function for effect is invalid!");
  }

  if (clearEffect && typeof clearEffect !== "function") {
    throw new Error("Only return function from effect as it's clearEffect");
  }

  container.storeEffet(effectKey, {
    clearEffect,
  });
};
