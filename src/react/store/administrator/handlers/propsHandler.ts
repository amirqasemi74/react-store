import { StoreAdministrator } from "../storeAdministrator";
import { StorePropsMetadataUtils } from "src/decorators/props";

export function propsHandler(
  storeAdministrator: StoreAdministrator,
  props?: object
) {
  const propsPropertyKey = StorePropsMetadataUtils.get(storeAdministrator.type);
  if (propsPropertyKey) {
    storeAdministrator.propertyKeysManager.onSetPropertyKey(
      propsPropertyKey,
      props,
      true
    );
  }
}
