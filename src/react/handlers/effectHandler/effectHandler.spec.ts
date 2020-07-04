import { STORE_REF } from "src/react/constant";
import Store from "src/react/store";
import { DependeciesExtarctor, GetSetStack } from ".";
import proxyDeep from "./proxyDeep";

describe("Effect handler", () => {
  describe("Dependecies Detector", () => {
    it("detect dependecies correctly", () => {
      class UserStore {
        username = "amir.qasemi74";
        password = "12345678";
        obj = {
          a: 1,
          b: {
            c: 1,
          },
        };
        arr = ["1", "2", "3", "4", "5"];

        effect1() {
          const a = this.username;
          const b = this.obj.a;
          const c = this.obj.b.c;
          const d = a;
          const f = this.arr[2];
        }
      }

      const target = new UserStore();
      const store = new Store({ instance: target, id: "id" });
      target[STORE_REF] = store;
      const getSetStack: GetSetStack[] = [];
      const userStore = proxyDeep({
        target,
        getSetStack,
      });
      userStore.effect1();
      const dependecies = DependeciesExtarctor(getSetStack, store);
      expect(dependecies).toEqual([
        "effect1",
        "username",
        "obj.a",
        "obj.b.c",
        "arr.2",
      ]);
    });
  });
});
