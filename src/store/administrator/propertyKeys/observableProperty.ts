import { StoreAdministrator } from "../storeAdministrator";
import { adtProxyBuilder } from "src/proxy/adtProxy/adtProxyBuilder";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";
import { isPrimitive } from "src/utils/isPrimitive";

export class ObservableProperty {
  isPrimitive: boolean;

  isSetStatePending = false;

  proxiedValuesStorage = new Map<unknown, unknown>();

  private value: {
    store?: unknown;
    state?: unknown;
  };

  private _reactSetState?: () => void;

  constructor(private storeAdmin: StoreAdministrator, value: unknown) {
    this.isPrimitive = isPrimitive(value);
    value = this.makeDeepObservable(value);
    const _val = this.isPrimitive ? value : { $: value };
    this.value = {
      state: _val,
      store: _val,
    };
  }

  setReactSetState(setState: React.Dispatch<unknown>) {
    this._reactSetState = () => {
      const newValue = this.getValue("Store");
      setState?.(this.isPrimitive ? newValue : { $: newValue });
      this.isSetStatePending = false;
    };
  }

  get reactSetState() {
    return this._reactSetState;
  }

  setValue(value: unknown, to: "State" | "Store") {
    this.isPrimitive = isPrimitive(value);
    if (to === "Store") {
      value = this.makeDeepObservable(value);
    }
    switch (to) {
      case "State":
        return (this.value.state = value);
      case "Store":
        return (this.value.store = this.isPrimitive ? value : { $: value });
    }
  }

  getValue(from: "State" | "Store", doUnproxy = true) {
    switch (from) {
      case "State": {
        const value = this.isPrimitive
          ? this.value.state
          : // due to performance we return pure values of store properties
            // not proxied ones, pure value does not collect access logs
            // and this is good
            (this.value.state as { $: unknown } | undefined)?.$;

        return doUnproxy ? getUnproxiedValue(value) : value;
      }
      case "Store":
        return this.isPrimitive
          ? this.value.store
          : (this.value.store as { $: unknown } | undefined)?.$;
    }
  }

  private makeDeepObservable(value: unknown) {
    const observable = adtProxyBuilder({
      value,
      proxiedValuesStorage: this.proxiedValuesStorage,
      onSet: () => this.doOnSet(),
    });
    return observable;
  }

  doOnSet() {
    this.isSetStatePending = true;
    this.storeAdmin.renderConsumers();
  }
}
