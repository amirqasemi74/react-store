import { AutoEffect, AutoWire, Store, StorePart } from "@react-store/core";

@StorePart()
class ValidatorX {
  obj = { a: { b: 1 } };
}

@Store()
export class StorePartStore {
  @AutoWire()
  validator: ValidatorX;

  resetStorePart() {
    this.validator = "sdf" as any;
  }

  // @AutoEffect()
  effectSp() {
    // this.validator.obj.a;
  }
}
