import { ClassType } from "src/types";
import { getFromContainer } from "src/container";
import ReactAppContext from "../appContext";
import { useContext } from "react";

const storeInjectionHandler = (storeType: ClassType) => {
  const deps: ClassType[] =
    Reflect.getMetadata("design:paramtypes", storeType) || [];
  const storeDepsValue = new Map<Function, object>();

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

    const context = useContext(storeContext);
    if (!context) {
      throw new Error(
        `${dep.name} haven't been connected to the component tree!`
      );
    }
    storeDepsValue.set(dep, context.instance);
  });

  return storeDepsValue;
};

const appContext = getFromContainer(ReactAppContext);

export default storeInjectionHandler;
