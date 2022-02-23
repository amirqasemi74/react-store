import { isPrimitive } from "src/utils/isPrimitive";

export class Property {
  /**
   * Property which doesn't have React.useState
   */
  isPure = false;

  proxiedValuesStorage: Map<unknown, unknown>;

  isSetStatePending = false;

  isPrimitive: boolean;

  private value: {
    store?: unknown;
    state?: unknown;
  };

  private _reactSetState?: () => void;

  constructor(
    value: unknown,
    proxiedValuesStorage: Map<unknown, unknown>,
    isPure?: boolean
  ) {
    this.isPure = !!isPure;
    this.proxiedValuesStorage = proxiedValuesStorage;
    this.isPrimitive = isPrimitive(value);
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
    switch (to) {
      case "State":
        return (this.value.state = value);
      case "Store":
        return (this.value.store = this.isPrimitive ? value : { $: value });
    }
  }

  getValue(from: "State" | "Store") {
    if (this.isPure) {
      from = "Store";
    }
    switch (from) {
      case "State":
        return this.isPrimitive
          ? this.value.state
          : (this.value.state as { $: unknown } | undefined)?.$;
      case "Store":
        return this.isPrimitive
          ? this.value.store
          : (this.value.store as { $: unknown } | undefined)?.$;
    }
  }
}
