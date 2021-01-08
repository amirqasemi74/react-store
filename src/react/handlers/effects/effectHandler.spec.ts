import { STORE_ADMINISTRATION } from "src/constant";
import adtProxyBuilder from "src/proxy/adtProxy";
import StoreAdministration from "src/react/store/storeAdministration";
import dependeciesExtarctor, {
  GetSetLog,
} from "src/setGetPathDetector/dependencyExtractor";

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
      const storeAdministration = new StoreAdministration();
      storeAdministration.init({ instance: target, id: "id" });
      target[STORE_ADMINISTRATION] = storeAdministration;
      const getSetLogs: GetSetLog[] = [];
      const userStore = adtProxyBuilder({
        getSetLogs,
        value: target,
      });
      userStore.effect1();
      const dependecies = dependeciesExtarctor(
        getSetLogs,
        storeAdministration.pureInstance
      );

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
