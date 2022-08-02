export class ReadonlyProperty {
  constructor(private value: unknown) {}

  setValue(value: unknown) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}
