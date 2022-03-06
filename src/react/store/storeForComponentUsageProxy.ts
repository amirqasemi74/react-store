import { StoreAdministrator } from "./administrator/storeAdministrator";

export class StoreForComponentUsageProxy implements ProxyHandler<object> {
  get(target: object, propertyKey: PropertyKey, receiver: unknown) {
    const storeAdmin = StoreAdministrator.get(target);

    if (storeAdmin?.propertyKeysManager.propertyKeys.has(propertyKey)) {
      return storeAdmin?.propertyKeysManager.propertyKeys
        .get(propertyKey)
        ?.getValue("State");
    }

    if (storeAdmin?.gettersManager.getters.has(propertyKey)) {
      return storeAdmin.gettersManager.getters.get(propertyKey)?.getValue("State");
    }

    return Reflect.get(target, propertyKey, receiver);
  }
}
