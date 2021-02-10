import isPromise from "is-promise";
import adtProxyBuilder from "src/proxy/adtProxy/adtProxyBuilder";
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
  const context = adtProxyBuilder({
    value: _context,
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
