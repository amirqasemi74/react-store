import Store from "../store";
import { PROPS_PROPERTY_KEY } from "../../constant";
import { useEffect } from "react";

export default function propsHandler(store: Store, props: object) {
  const propsPropertyKey: string | undefined = Reflect.get(
    store.constructorType,
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
