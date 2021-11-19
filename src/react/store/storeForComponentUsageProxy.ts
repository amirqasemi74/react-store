import { getStoreAdministrator } from "src/utils/utils";

export class StoreForComponentUsageProxy implements ProxyHandler<object> {
  get(target: object, propertyKey: PropertyKey, receiver: any) {
    const storeAdmin = getStoreAdministrator(target);

    if (
      !storeAdmin?.methods.has(propertyKey) &&
      storeAdmin?.propertyKeys.has(propertyKey)
    ) {
      return storeAdmin?.propertyKeys.get(propertyKey)?.getValue("State");
    }

    return Reflect.get(target, propertyKey, receiver);
  }
}
