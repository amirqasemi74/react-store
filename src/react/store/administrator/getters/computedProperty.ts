import { AccessedPath } from "../propertyKeys/storePropertyKeysManager";
import { StoreAdministrator } from "../storeAdministrator";
import lodashGet from "lodash/get";

export class ComputedProperty {
  private inited = false;

  private hasStoreValCopiedToStateVal = false;

  private readonly lastValue: {
    store: unknown;
    state: unknown;
  } = { state: null, store: null };

  deps: AccessedPath[] = [];

  constructor(
    private storeAdmin: StoreAdministrator,
    public getterFn: () => unknown
  ) {}

  getValue(from: "State" | "Store") {
    if (!this.inited) {
      this.calcStoreValue();
      this.lastValue.state = this.lastValue.store;
      this.inited = true;
      this.hasStoreValCopiedToStateVal = true;
    }

    if (!this.hasStoreValCopiedToStateVal && from === "State") {
      this.copyStoreValueToStateValueIfPossible();
    }
    return this.lastValue[from.toLowerCase()];
  }

  private calcStoreValue() {
    const propertyKeysManager = this.storeAdmin.propertyKeysManager;
    propertyKeysManager.clearAccessedProperties();
    this.lastValue.store = this.getterFn.call(this.storeAdmin.instance);
    this.deps = propertyKeysManager
      .calcPaths()
      .filter((p) => p.type === "GET")
      .map((p) => p.path);
    this.hasStoreValCopiedToStateVal = false;
  }

  tryRecomputeIfNeed(setPaths: AccessedPath[]) {
    const recompute = setPaths.some((setPath) =>
      this.deps.some(
        (dep) =>
          dep.every((item, index) => item === setPath[index]) ||
          setPath.every((item, index) => item === dep[index])
      )
    );
    if (recompute) {
      this.calcStoreValue();
    }
  }

  private copyStoreValueToStateValueIfPossible() {
    // Because react 18 transition mode
    const doCopy = this.deps.every(
      (dep) =>
        lodashGet(this.storeAdmin.instance, dep) ===
        lodashGet(this.storeAdmin.instanceForComponents, dep)
    );
    if (doCopy) {
      this.lastValue.state = this.lastValue.store;
      this.hasStoreValCopiedToStateVal = true;
    }
  }
}
