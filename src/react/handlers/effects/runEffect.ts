import isPromise from "is-promise";
import { StoreAdministrator } from "src/react/store/storeAdministrator";

interface RunEffectArgs {
  effectKey: PropertyKey;
  storeAdmin: StoreAdministrator;
}

type Func<T = void> = () => T;

export const runEffect = ({ effectKey, storeAdmin }: RunEffectArgs) => {
  //run ...
  const clearEffect: Func | undefined = Reflect.apply(
    storeAdmin.instanceForComponents[effectKey],
    storeAdmin.instanceForComponents,
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
