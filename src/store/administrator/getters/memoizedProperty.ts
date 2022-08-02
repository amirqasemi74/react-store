import { StoreAdministrator } from "../storeAdministrator";
import cloneDeep from "clone-deep";
import { dequal } from "dequal";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";

export class MemoizedProperty {
  private getterFn: () => unknown;

  private inited = false;

  private manualDepsFn: DepFn;

  private preDepValues: unknown[];

  private deepEqual: boolean;

  private storeAdmin: StoreAdministrator;

  private value: unknown;

  constructor(options: {
    deepEqual?: boolean;
    depFn?: DepFn;
    getter: () => unknown;
    storeAdmin: StoreAdministrator;
  }) {
    this.deepEqual = this.deepEqual;
    options.depFn && (this.manualDepsFn = options.depFn);
    this.getterFn = options.getter;
    this.storeAdmin = options.storeAdmin;
  }

  getValue(from: "State" | "Store") {
    if (!this.inited) {
      this.calcStoreValue();
    }
    return from === "Store" ? this.value : getUnproxiedValue(this.value);
  }

  private calcStoreValue() {
    this.inited = true;
    this.value = this.getterFn.call(this.storeAdmin.instanceForComponents);
  }

  tryRecomputeIfNeed() {
    const isEqual = this.deepEqual ? dequal : Object.is;
    /**
     * Here because we get deps for instanceForComponents, it's unproxied
     * by default. So we don't need to make it unproxy
     */
    const depsValues = this.manualDepsFn(this.storeAdmin.instanceForComponents);

    if (depsValues.some((v, i) => !isEqual(v, this.preDepValues?.[i]))) {
      this.preDepValues = this.deepEqual ? cloneDeep(depsValues, true) : depsValues;
      this.calcStoreValue();
    }
  }
}

type DepFn = (o: object) => Array<unknown>;
