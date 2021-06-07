import { getStorePropsPropertyKey } from "src/decorators/props";
import { StoreAdministrator } from "../store/storeAdministrator";

export function propsHandler(
  storeAdministrator: StoreAdministrator,
  props: object
) {
  const propsPropertyKey = getStorePropsPropertyKey(storeAdministrator.type);
  if (propsPropertyKey) {
    storeAdministrator.turnOffRender();
    Reflect.set(storeAdministrator.instance, propsPropertyKey, props);
    storeAdministrator.turnOnRender();
  }
}
