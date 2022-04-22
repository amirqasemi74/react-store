import { StoreAdministrator } from "../storeAdministrator";
import { MemoizedProperty } from "./memoizedProperty";
import { MemosMetadataUtils } from "src/decorators/memo";

export class StoreGettersManager {
  readonly getters = new Map<PropertyKey, MemoizedProperty>();

  constructor(private storeAdmin: StoreAdministrator) {}

  makeAllAsComputed() {
    // @Memo Decorator
    this.memosMetaData.forEach((metadata) => {
      const getter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(this.storeAdmin.instance),
        metadata.propertyKey
      )?.get;

      if (getter) {
        const memoized = new MemoizedProperty({
          getter,
          storeAdmin: this.storeAdmin,
          depFn: metadata.options.deps,
          deepEqual: metadata.options.deepEqual,
        });
        this.getters.set(metadata.propertyKey, memoized);
      }
    });

    this.getters.forEach((memoized, propertyKey) => {
      const desc = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(this.storeAdmin.instance),
        propertyKey
      );

      Object.defineProperty(this.storeAdmin.instance, propertyKey, {
        ...desc,
        get: () => memoized.getValue("Store"),
      });
    });

    this.storeAdmin.hooksManager.reactHooks.add({
      when: "AFTER_INSTANCE",
      hook: () => this.getters.forEach((cp) => cp.tryRecomputeIfNeed()),
    });
  }

  get memosMetaData() {
    // For overridden store methods we have two metadata
    // so we must filter duplicate ones
    return MemosMetadataUtils.get(this.storeAdmin.type).filter(
      (v, i, data) => i === data.findIndex((vv) => vv.propertyKey === v.propertyKey)
    );
  }
}
