import { StoreAdministrator } from "../storeAdministrator";
import { StorePropsMetadataUtils } from "src/decorators/props";

export function propsHandler(
  storeAdministrator: StoreAdministrator,
  props?: object
) {
  const propsPropertyKey = StorePropsMetadataUtils.get(storeAdministrator.type);
  if (propsPropertyKey) {
    Reflect.set(storeAdministrator.instance, propsPropertyKey, props);
  }
}
