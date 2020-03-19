import Store from "../store";
import { PROPS_PROPERTY_KEY } from "../constant";
import { useEffect } from "react";

export default function propsHandler(props: any, store: Store) {
  const propsPropertyKey: string | undefined = Reflect.get(
    store.type,
    PROPS_PROPERTY_KEY
  );
  useEffect(() => {
    if (propsPropertyKey) {
      store.turnOffRender();
      Reflect.set(store.instance, propsPropertyKey, props);
      store.turnOnRender();
    }
  }, [props]);
}
