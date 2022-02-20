import { StoreAdministrator } from "./administrator/storeAdministrator";
import { StorePropsMetadataUtils } from "src/decorators/props";

export class StoreForComponentUsageProxy implements ProxyHandler<object> {
  get(target: object, propertyKey: PropertyKey, receiver: unknown) {
    const storeAdmin = StoreAdministrator.get(target);

    // Props must get from store value not state value
    if (StorePropsMetadataUtils.is(storeAdmin.type, propertyKey)) {
      return Reflect.get(target, propertyKey, receiver);
    }

    if (storeAdmin?.propertyKeysManager.propertyKeys.has(propertyKey)) {
      const value = storeAdmin?.propertyKeysManager.propertyKeys
        .get(propertyKey)
        ?.getValue("State");

      storeAdmin.propertyKeysManager.addAccessedProperty({
        value,
        target,
        type: "GET",
        propertyKey,
      });

      return value;
    } else if (storeAdmin.gettersManager.getters.has(propertyKey)) {
      return storeAdmin.gettersManager.getters.get(propertyKey)?.getValue("State");
    }

    return Reflect.get(target, propertyKey, receiver);
  }
}
