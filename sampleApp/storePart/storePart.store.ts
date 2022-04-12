import { AutoWire, Store, StorePart } from "@react-store/core";

@StorePart()
class ValidatorX {
  obj = { a: { b: 12 } };
  constructor() {
    setTimeout(() => {
      this.obj.a.b = 155;
    }, 1000);
  }
}

@Store()
export class UpperStore {
  a = [1, 2, 33];

  constructor() {
    setTimeout(() => {
      // this.a[1];
      // this.a = [1, 2, 3, 44, 5, 5];
    }, 1000);
  }
}

@Store()
export class StorePartStore {
  @AutoWire()
  part: ValidatorX;

  isShow = true;

  constructor(public upperStore: UpperStore) {}

  show() {
    this.isShow = !this.isShow;
  }

  get objab() {
    return this.part.obj.a.b;
  }

  get len() {
    return this.upperStore.a.length;
  }
}
