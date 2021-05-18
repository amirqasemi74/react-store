import isPromise from "is-promise";
import adtProxyBuilder from "src/proxy/adtProxy/adtProxyBuilder";
import { StoreAdministrator } from "src/react/store/StoreAdministrator";

interface RunEffectArgs {
  effectKey: PropertyKey;
  storeAdmin: StoreAdministrator;
}

type Func<T = void> = () => T;

export const runEffect = ({ effectKey, storeAdmin }: RunEffectArgs) => {
  const context = adtProxyBuilder({
    value: storeAdmin.instance,
  });

  //run ...
  const clearEffect: Func | undefined = Reflect.apply(
    storeAdmin.pureInstance[effectKey],
    context,
    []
  );

  if (isPromise(clearEffect)) {
    throw new Error("Async function for effect is invalid!");
  }

  if (clearEffect && typeof clearEffect !== "function") {
    throw new Error("Only return function from effect as it's clearEffect");
  }

  storeAdmin.storeEffect(effectKey, {
    clearEffect,
  });
};
