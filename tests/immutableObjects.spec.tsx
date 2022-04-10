import { AutoEffect, Store, connect, useStore } from "@react-store/core";
import { render } from "@testing-library/react";
import React from "react";
import { StoreAdministrator } from "src/store/administrator/storeAdministrator";

describe("Immutable Objects & Arrays", () => {
  it("should inner immutable object have same instance ref in each render", () => {
    let store!: FrozenStore;
    @Store()
    class FrozenStore {
      obj: any = Object.freeze({ a: 1, b: 2, c: Object.freeze({ d: 1 }) });
    }

    const App = connect(() => {
      store = useStore(FrozenStore);
      return <>Frozen Object</>;
    }, FrozenStore);

    render(<App />);

    expect(store.obj.c).toBe(store.obj.c);
  });

  describe("Frozen Objects & Arrays", () => {
    it("should return correct value of frozen objects", () => {
      let store!: FrozenStore;
      @Store()
      class FrozenStore {
        obj: any = Object.freeze({ a: 1, b: 2, c: Object.freeze({ d: 1 }) });

        @AutoEffect()
        frozenAccess() {
          this.obj.c.d;
          debugger;
        }
      }

      const App = connect(() => {
        store = useStore(FrozenStore);
        return <>Frozen Object</>;
      }, FrozenStore);

      render(<App />);

      expect(store.obj).toStrictEqual({ a: 1, b: 2, c: { d: 1 } });
      expect(store.obj.c).toStrictEqual({ d: 1 });

      expect(
        StoreAdministrator.get(store)!.effectsManager.effects.get("frozenAccess")
          ?.deps
      ).toStrictEqual([["obj", "c", "d"]]);
    });

    it("should return correct value of frozen arrays", () => {
      let store!: FrozenStore;
      @Store()
      class FrozenStore {
        arr: any = Object.freeze([1, 2, Object.freeze([3, 4])]);
      }

      const App = connect(() => {
        store = useStore(FrozenStore);
        return <>Frozen Object</>;
      }, FrozenStore);

      render(<App />);

      expect(store.arr).toStrictEqual([1, 2, [3, 4]]);
      expect(store.arr[2]).toStrictEqual([3, 4]);
    });
  });

  describe("Sealed Objects & Arrays", () => {
    it("should return correct value of seal objects", () => {
      let store!: SealedStore;
      @Store()
      class SealedStore {
        obj: any = Object.seal({ a: 1, b: 2, c: Object.seal({ d: 1 }) });
      }

      const App = connect(() => {
        store = useStore(SealedStore);
        return <>Frozen Object</>;
      }, SealedStore);

      render(<App />);

      expect(store.obj).toStrictEqual({ a: 1, b: 2, c: { d: 1 } });
      expect(store.obj.c).toStrictEqual({ d: 1 });
    });

    it("should return correct value of seal arrays", () => {
      let store!: SealedStore;
      @Store()
      class SealedStore {
        arr: any = Object.seal([1, 2, Object.seal([3, 4])]);
      }

      const App = connect(() => {
        store = useStore(SealedStore);
        return <>Frozen Object</>;
      }, SealedStore);

      render(<App />);

      expect(store.arr).toStrictEqual([1, 2, [3, 4]]);
      expect(store.arr[2]).toStrictEqual([3, 4]);
    });
  });

  describe("Prevented Extension Objects & Array", () => {
    it("should return correct value of prevented extensions objects", () => {
      let store!: PreventedExtensionStore;
      @Store()
      class PreventedExtensionStore {
        obj: any = Object.preventExtensions({
          a: 1,
          b: 2,
          c: Object.preventExtensions({ d: 1 }),
        });
      }

      const App = connect(() => {
        store = useStore(PreventedExtensionStore);
        return <>Frozen Object</>;
      }, PreventedExtensionStore);

      render(<App />);

      expect(store.obj).toStrictEqual({ a: 1, b: 2, c: { d: 1 } });
      expect(store.obj.c).toStrictEqual({ d: 1 });
    });

    it("should return correct value of prevented extensions arrays", () => {
      let store!: PreventedExtensionStore;
      @Store()
      class PreventedExtensionStore {
        arr: any = Object.seal([1, 2, Object.seal([3, 4])]);
      }

      const App = connect(() => {
        store = useStore(PreventedExtensionStore);
        return <>Frozen Object</>;
      }, PreventedExtensionStore);

      render(<App />);

      expect(store.arr).toStrictEqual([1, 2, [3, 4]]);
      expect(store.arr[2]).toStrictEqual([3, 4]);
    });
  });
});
