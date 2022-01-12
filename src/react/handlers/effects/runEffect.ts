import isPromise from "is-promise";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";

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

  if (clearEffect && !isPromise(clearEffect) && typeof clearEffect === "function") {
    storeAdmin.effectsManager.setClearEffect(effectKey, clearEffect);
  }
};
