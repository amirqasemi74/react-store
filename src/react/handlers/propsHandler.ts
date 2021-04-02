import { StoreAdministration } from "../store/storeAdministration";
import { useEffect } from "react";
import { getStorePropsPropertyKey } from "src/decorators/props";

export default function propsHandler(
  storeAdministration: StoreAdministration,
  props: object
) {
  const propsPropertyKey = getStorePropsPropertyKey(storeAdministration.type);
  useEffect(() => {
    if (propsPropertyKey) {
      storeAdministration.turnOffRender();
      Reflect.set(storeAdministration.instance, propsPropertyKey, props);
      storeAdministration.turnOnRender();
    }
  }, [props]);
}
