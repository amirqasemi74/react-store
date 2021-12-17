import { StoreAdministrator } from "./administrator/storeAdministrator";

export class StoreForComponentUsageProxy implements ProxyHandler<object> {
  get(target: object, propertyKey: PropertyKey, receiver: any) {
    const storeAdmin = StoreAdministrator.get(this);

    if (
      !storeAdmin?.methodsManager.methods.has(propertyKey) &&
      storeAdmin?.propertyKeysManager.propertyKeys.has(propertyKey)
    ) {
      return storeAdmin?.propertyKeysManager.propertyKeys
        .get(propertyKey)
        ?.getValue("State");
    }

    return Reflect.get(target, propertyKey, receiver);
  }
}
