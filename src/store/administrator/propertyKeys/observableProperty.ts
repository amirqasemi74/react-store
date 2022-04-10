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

  constructor(
    private storeAdmin: StoreAdministrator,
    value: unknown,
    public isReadOnly?: boolean
  ) {
    this.isPrimitive = isPrimitive(value);
    value = this.makeDeepObservable(value, isReadOnly);
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

  setValue(value: unknown, to: "State" | "Store", readonly?: boolean) {
    this.isPrimitive = isPrimitive(value);
    if (to === "Store") {
      value = this.makeDeepObservable(value, readonly);
    }
    switch (to) {
      case "State":
        return (this.value.state = value);
      case "Store":
        return (this.value.store = this.isPrimitive ? value : { $: value });
    }
  }

  getValue(from: "State" | "Store") {
    if (this.isReadOnly) {
      from = "Store";
    }
    switch (from) {
      case "State":
        return this.isPrimitive
          ? this.value.state
          : // due to performance we return pure values of store properties
            // not proxied ones, pure value does not collect access logs
            // and this is good
            getUnproxiedValue((this.value.state as { $: unknown } | undefined)?.$);
      case "Store":
        return this.isPrimitive
          ? this.value.store
          : (this.value.store as { $: unknown } | undefined)?.$;
    }
  }

  private makeDeepObservable(value: unknown, readonly?: boolean) {
    this.storeAdmin.propertyKeysManager.turnOffCollectAccessPathLogs();
    const observable = adtProxyBuilder({
      value,
      proxiedValuesStorage: this.proxiedValuesStorage,
      onAccess: (...args) =>
        this.storeAdmin.propertyKeysManager.addAccessedProperty(...args),
      onSet: () => {
        this.isSetStatePending = false;
        if (!readonly) {
          this.isSetStatePending = true;
          this.storeAdmin.renderConsumers();
        }
      },
    });
    this.storeAdmin.propertyKeysManager.turnOnCollectAccessPathLogsIfNeeded();
    return observable;
  }
}
