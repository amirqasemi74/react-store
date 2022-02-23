import { StoreAdministrator } from "../storeAdministrator";
import { useEffect } from "react";
import { StorePropsMetadataUtils } from "src/decorators/props";

export function propsHandler(
  storeAdministrator: StoreAdministrator,
  props?: object
) {
  const propsPropertyKey = StorePropsMetadataUtils.get(storeAdministrator.type);
  if (propsPropertyKey) {
    /**
     * We set only for effects dependencies or..
     */
    storeAdministrator.propertyKeysManager.onSetPropertyKey(
      propsPropertyKey,
      props,
      { forceSet: true }
    );

    /**
     * Again set and render for store consumers
     */
    useEffect(() => {
      storeAdministrator.propertyKeysManager.onSetPropertyKey(
        propsPropertyKey,
        props,
        { forceSet: true, forceRender: true }
      );
    }, [props]);
  }
}
