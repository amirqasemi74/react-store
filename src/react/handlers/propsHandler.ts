import StoreAdministration from "../storeAdministration";
import { useEffect } from "react";
import { getStorePropsPropertyKey } from "src/decorators/props";

export default function propsHandler(
  storeAdministration: StoreAdministration,
  props: object
) {
  const propsPropertyKey = getStorePropsPropertyKey(
    storeAdministration.constructorType
  );
  useEffect(() => {
    if (propsPropertyKey) {
      storeAdministration.turnOffRender();
      Reflect.set(storeAdministration.instance, propsPropertyKey, props);
      storeAdministration.turnOnRender();
    }
  }, [props]);
}
