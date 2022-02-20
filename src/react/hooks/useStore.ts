import { ReactApplicationContext } from "../appContext";
import { useContext, useRef } from "react";
import { getFromContainer } from "src/container/container";
import { ClassType } from "src/types";
import { useForceUpdate } from "src/utils/useForceUpdate";
import { useWillMount } from "src/utils/useWillMount";

export const useStore = <T extends ClassType>(storeType: T): InstanceType<T> => {
  const isUnMounted = useRef(false);
  const forceUpdate = useForceUpdate();
  const storeContext = getFromContainer(
    ReactApplicationContext
  ).getStoreReactContext(storeType);

  if (!storeContext) {
    throw new Error(
      `${storeType.name} haven't been connected to the component tree!`
    );
  }
  const storeAdmin = useContext(storeContext)!;

  useWillMount(() => {
    const render = () => {
      if (isUnMounted.current) return;
      forceUpdate();
    };
    storeAdmin.consumers.add(render);

    return () => {
      isUnMounted.current = true;
      storeAdmin.consumers.delete(render);
    };
  });

  return storeAdmin.instanceForComponents;
};
