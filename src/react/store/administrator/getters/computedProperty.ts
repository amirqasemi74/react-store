import { AccessedPath } from "../propertyKeys/storePropertyKeysManager";
import { StoreAdministrator } from "../storeAdministrator";
import lodashGet from "lodash/get";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";

export class ComputedProperty {
  private inited = false;

  private hasStoreValCopiedToStateVal = true;

  private readonly lastValue: {
    store: unknown;
    state: unknown;
  } = { state: null, store: null };

  deps: AccessedPath[] = [];

  constructor(
    private getterName: string,
    private getterFn: () => unknown,
    private storeAdmin: StoreAdministrator
  ) {}

  getValue(from: "State" | "Store") {
    if (!this.inited) {
      this.calcStoreValue();
      this.inited = true;
      this.lastValue.state = this.lastValue.store;
      this.hasStoreValCopiedToStateVal = true;
    }
    if (!this.hasStoreValCopiedToStateVal && from === "State") {
      this.copyStoreValueToStateValueIfPossible();
    }

    if (from === "Store") {
      return this.lastValue[from.toLowerCase()];
    } else {
      return getUnproxiedValue(this.lastValue[from.toLowerCase()]);
    }
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
    let recompute = setPaths.some((setPath) =>
      this.deps.some((dep) => setPath.every((item, index) => item === dep[index]))
    );
    /**
     * Check if any of this getter dependencies path
     * is from injected store (store or store parts)
     */
    recompute ||= this.deps.some((path) => {
      const firstPathElementValue = getUnproxiedValue(
        this.storeAdmin.propertyKeysManager.propertyKeys
          .get(path[0])
          ?.getValue("Store")
      );

      return StoreAdministrator.get(firstPathElementValue)?.lastSetPaths.some(
        (setPath) => setPath.every((item, index) => item === path[index + 1])
      );
    });
    if (recompute) {
      this.storeAdmin.lastSetPaths.push([this.getterName]);
      this.calcStoreValue();
    }
  }

  private copyStoreValueToStateValueIfPossible() {
    // Because react 18 transition mode
    const doCopy = this.deps.every((dep) => {
      /**
       * Here if we have injected store as dep such as [['upper','a']]
       * Get dep value from instance has more than one layer of proxy
       * so `getUnproxiedValue` must check deep for return unproxied value
       */
      return (
        getUnproxiedValue(lodashGet(this.storeAdmin.instance, dep), true) ===
        lodashGet(this.storeAdmin.instanceForComponents, dep)
      );
    });
    if (doCopy) {
      this.lastValue.state = this.lastValue.store;
      this.hasStoreValCopiedToStateVal = true;
    }
  }
}
