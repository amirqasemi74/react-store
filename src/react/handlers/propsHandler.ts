import { StorePropsMetadataUtils } from "src/decorators/props";
import { StoreAdministrator } from "../store/administrator/storeAdministrator";

export function propsHandler(
  storeAdministrator: StoreAdministrator,
  props: object
) {
  const propsPropertyKey = StorePropsMetadataUtils.get(storeAdministrator.type);
  if (propsPropertyKey) {
    Reflect.set(storeAdministrator.instance, propsPropertyKey, props);
  }
}
