import { isPrimitive } from "src/utils/isPrimitive";

export class ObservableProperty {
  isPrimitive: boolean;

  private value: {
    store?: unknown;
    state?: unknown;
  };

  private _reactSetState?: React.Dispatch<React.SetStateAction<unknown>>;

  constructor(value: unknown) {
    this.isPrimitive = isPrimitive(value);
    const _val = this.isPrimitive ? value : { $: value };
    this.value = {
      state: _val,
      store: _val,
    };
  }

  set reactSetState(setState) {
    this._reactSetState = (newValue) => {
      this.isPrimitive = isPrimitive(newValue);
      setState?.(this.isPrimitive ? newValue : { $: newValue });
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
