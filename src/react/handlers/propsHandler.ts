import { StoreAdministrator } from "../store/StoreAdministrator";
import { useEffect } from "react";
import { getStorePropsPropertyKey } from "src/decorators/props";

export default function propsHandler(
  storeAdministrator: StoreAdministrator,
  props: object
) {
  const propsPropertyKey = getStorePropsPropertyKey(storeAdministrator.type);
  useEffect(() => {
    if (propsPropertyKey) {
      storeAdministrator.turnOffRender();
      Reflect.set(storeAdministrator.instance, propsPropertyKey, props);
      storeAdministrator.turnOnRender();
    }
  }, [props]);
}
