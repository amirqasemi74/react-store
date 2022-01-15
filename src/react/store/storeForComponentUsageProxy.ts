import { StoreAdministrator } from "./administrator/storeAdministrator";

export class StoreForComponentUsageProxy implements ProxyHandler<object> {
  get(target: object, propertyKey: PropertyKey, receiver: any) {
    const storeAdmin = StoreAdministrator.get(target);

    if (storeAdmin?.propertyKeysManager.propertyKeys.has(propertyKey)) {
      const value: any = storeAdmin?.propertyKeysManager.propertyKeys
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
