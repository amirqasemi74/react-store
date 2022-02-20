import { AutoEffect, Store } from "@react-store/core";

@Store()
export class AutoEffectStore {
  a = 4;
  b = 3;
  c: any = [1, 2, 3, { a: 1 }];
  d = { e: 5 };

  arrB: any = [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 5 }, { v: 6 }, { v: 7 }];

  user = { name: "sdf", pass: "123" };

  // @AutoEffect()
  onUserChanged() {
    this.user.name;
    this.user = { ...this.user };
  }

  // @AutoEffect()
  auto1() {
    this.a = 3;
    this.b = this.a;
    this.c[this.b].a = 45;
    this.c[3];
    this.d.e;
  }

  // @AutoEffect()
  auto2() {
    this.d.toString();
  }

  // @AutoEffect()
  auto3() {
    this.arrB.filter((e) => e.v > 3).length;
  }
}
