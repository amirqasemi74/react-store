import Store from "../store";
import { useEffect } from "react";
import { getStorePropsPropertyKey } from "src/decorators/props";

export default function propsHandler(store: Store, props: object) {
  const propsPropertyKey = getStorePropsPropertyKey(store.constructorType);
  useEffect(() => {
    if (propsPropertyKey) {
      store.turnOffRender();
      Reflect.set(store.instance, propsPropertyKey, props);
      store.turnOnRender();
    }
  }, [props]);
}
