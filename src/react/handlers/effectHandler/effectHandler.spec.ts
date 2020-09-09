import adtProxyBuilder from "src/proxy/adtProxy";
import { STORE_REF } from "src/constant";
import Store from "src/react/store";
import dependeciesExtarctor, {
  GetSetLog,
} from "../../../setGetPathDetector/dependencyExtractor";

describe("Effect handler", () => {
  describe("Dependecies Detector", () => {
    it.only("detect dependecies correctly", () => {
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
      const getSetLogs: GetSetLog[] = [];
      const userStore = adtProxyBuilder({
        getSetLogs,
        store,
        value: target,
      });
      userStore.effect1();
      const dependecies = dependeciesExtarctor(getSetLogs, store);

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
