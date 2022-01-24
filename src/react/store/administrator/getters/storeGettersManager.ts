import { StoreAdministrator } from "../storeAdministrator";
import { ComputedProperty } from "./computedProperty";

export class StoreGettersManager {
  readonly getters = new Map<PropertyKey, ComputedProperty>();

  constructor(private storeAdmin: StoreAdministrator) {}

  makeAllAsComputed() {
    Object.entries(
      Object.getOwnPropertyDescriptors(
        Object.getPrototypeOf(this.storeAdmin.instance)
      )
    )
      .filter(([, { get }]) => get)
      .forEach(([propertyKey, desc]) => {
        const computed = new ComputedProperty(this.storeAdmin, desc.get!);
        this.getters.set(propertyKey, computed);
        Object.defineProperty(this.storeAdmin.instance, propertyKey, {
          ...desc,
          get: () => computed.getValue("Store"),
        });
      });
  }

  recomputedGetters() {
    const propertyKeysManager = this.storeAdmin.propertyKeysManager;
    const setPaths = propertyKeysManager.calcSetPaths();
    propertyKeysManager.clearAccessProperties();
    Array.from(this.getters.values()).forEach((cp) =>
      cp.tryRecomputeIfNeed(setPaths)
    );
  }
}
