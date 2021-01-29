import { useContext } from "react";
import { getFromContainer } from "src/container";
import { getConstructorDependencyTypes } from "src/decorators/inject";
import { ClassType } from "src/types";
import { ReactApplicationContext } from "../appContext";
import StoreAdministration from "../store/storeAdministration";

const storeInjectionHandler = (storeType: ClassType) => {
  const storeDeps = getConstructorDependencyTypes(storeType);
  const storeDepsValue = new Map<Function, StoreAdministration>();
  const appContext = getFromContainer(ReactApplicationContext);

  // Find dependecies which is store type
  // then resolve them from context
  //TODO: for global stores
  storeDeps.forEach((dep) => {
    if (dep.type === storeType) {
      throw new Error(
        `You can't inject ${storeType.name} into ${storeType.name}!`
      );
    }
    const storeContext = appContext.findStoreContext(dep.type);
    if (!storeContext) {
      return;
    }
    const store = useContext(storeContext);
    if (!store) {
      throw new Error(
        `${dep.type.name} haven't been connected to the component tree!`
      );
    }
    storeDepsValue.set(dep.type, store);
  });

  return storeDepsValue;
};

export default storeInjectionHandler;
