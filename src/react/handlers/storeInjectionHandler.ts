import { ClassType } from "src/types";
import { getFromContainer } from "src/container";
import ReactAppContext from "../appContext";
import { useContext } from "react";
import Store from "../store";

const storeInjectionHandler = (storeType: ClassType) => {
  const deps: ClassType[] =
    Reflect.getMetadata("design:paramtypes", storeType) || [];
  const storeDepsValue = new Map<Function, Store>();
  const appContext = getFromContainer(ReactAppContext);

  // Find dependecies which is store type
  // then resolve them from context
  //TODO: for global stores
  deps.forEach((dep) => {
    if (dep === storeType) {
      throw new Error(
        `You can't inject ${storeType.name} into ${storeType.name}!`
      );
    }

    const storeContext = appContext.findStoreContext(dep);
    if (!storeContext) {
      return;
    }

    const store = useContext(storeContext);
    if (!store) {
      throw new Error(
        `${dep.name} haven't been connected to the component tree!`
      );
    }
    storeDepsValue.set(dep, store);
  });

  return storeDepsValue;
};

export default storeInjectionHandler;
