import { getStorePropsPropertyKey } from "src/decorators/props";
import { StoreAdministrator } from "../store/administrator/storeAdministrator";

export function propsHandler(
  storeAdministrator: StoreAdministrator,
  props: object
) {
  const propsPropertyKey = getStorePropsPropertyKey(storeAdministrator.type);
  if (propsPropertyKey) {
    Reflect.set(storeAdministrator.instance, propsPropertyKey, props);
  }
}
