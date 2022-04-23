import { StoreAdministrator } from "../storeAdministrator";
import { MemoizedProperty } from "./memoizedProperty";
import { MemosMetadataUtils } from "src/decorators/memo";

export class StoreGettersManager {
  readonly getters = new Map<PropertyKey, MemoizedProperty>();

  constructor(private storeAdmin: StoreAdministrator) {}

  registerMemos() {
    this.memosMetaData.forEach((metadata) => {
      const descriptor = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(this.storeAdmin.instance),
        metadata.propertyKey
      );

      if (descriptor?.get) {
        const memoized = new MemoizedProperty({
          getter: descriptor.get,
          storeAdmin: this.storeAdmin,
          depFn: metadata.options.deps,
          deepEqual: metadata.options.deepEqual,
        });

        Object.defineProperty(this.storeAdmin.instance, metadata.propertyKey, {
          ...descriptor,
          get: () => memoized.getValue("Store"),
        });

        this.getters.set(metadata.propertyKey, memoized);
      }
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
