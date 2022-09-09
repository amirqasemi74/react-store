import { ReactStore } from "..";
import { ReactApplicationContext } from "../appContext";
import { useContext } from "react";
import { ClassType } from "src/types";

export const useStore = <T extends ClassType>(storeType: T): InstanceType<T> => {
  const StoreContext = ReactStore.container
    .resolve(ReactApplicationContext)
    .getStoreReactContext(storeType);

  if (!StoreContext) {
    throw new Error(
      `${storeType.name} haven't been connected to the component tree!`
    );
  }

  const context = useContext(StoreContext);

  if (!context) {
    throw new Error(`\`${storeType.name}\` can't be reached.`);
  }

  return context.storeAdmin.instanceForComponents;
};
