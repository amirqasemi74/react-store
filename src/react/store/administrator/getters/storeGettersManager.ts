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
        const computed = new ComputedProperty(
          propertyKey,
          desc.get!,
          this.storeAdmin
        );
        this.getters.set(propertyKey, computed);
        Object.defineProperty(this.storeAdmin.instance, propertyKey, {
          ...desc,
          get: () => {
            const value = computed.getValue("Store");
            this.storeAdmin.propertyKeysManager.addAccessedProperty({
              value,
              propertyKey,
              type: "GET",
              target: this.storeAdmin.instance,
            });
            return value;
          },
        });
      });
  }

  recomputedGetters() {
    this.storeAdmin.lastSetPaths = this.storeAdmin.propertyKeysManager
      .calcPaths()
      .filter((p) => p.type === "SET")
      .map((p) => p.path);
    this.getters.forEach((cp) =>
      cp.tryRecomputeIfNeed(this.storeAdmin.lastSetPaths)
    );
  }
}
