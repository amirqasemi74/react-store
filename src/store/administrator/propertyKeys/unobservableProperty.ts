export class UnobservableProperty {
  constructor(private value: unknown, public readonly isReadonly = false) {}

  setValue(value: unknown) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}
