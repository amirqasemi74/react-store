import { AutoWire, Memo, Store, StorePart } from "@react-store/core";

@StorePart()
class ComputedStorePart {
  obj = { a: { b: [1, 2, 3, 4] } };
}

@Store()
export class UpperComputedStore {
  obj = { a: 1 };

  changeObj() {
    this.obj.a = 2;
  }

  // get objStr() {
  //   return JSON.stringify(this.obj);s
  // }
}

@Store()
export class ComputedStore {
  arr = [1, 2, 3];

  @AutoWire()
  part: ComputedStorePart;

  constructor(public upper: UpperComputedStore) {}

  // @AutoEffect()
  changeUpperObj() {
    // this.upper.changeObj();
  }

  @Memo("part.obj.a.b")
  get partObjArrLen() {
    return this.part.obj.a.b.length;
  }

  @Memo("arr")
  get arrLen() {
    return this.arr.length;
  }

  changeArray() {
    this.arr = [1, 2, 3, 4, 5];
  }
}
