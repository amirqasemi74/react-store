import {
  AutoEffect,
  AutoWire,
  Store,
  StorePart,
  connect,
  useStore,
} from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { act, render } from "@testing-library/react";
import React from "react";
import { StoreAdministrator } from "src/store/administrator/storeAdministrator";

describe("Store Administrator Performance", () => {
  it("should not collect accessed path logs if there is no autoEffect, computed and store not injected to any other store", () => {
    let store!: PureStore;

    @Store()
    class PureStore {
      arr = [1, { a: 1 }] as const;

      constructor() {
        store = this;
      }
    }

    const App = connect(() => {
      useStore(PureStore);
      return <>{store.arr[1].a}</>;
    }, PureStore);

    render(<App />);

    const storeAdmin = StoreAdministrator.get(store);

    expect(storeAdmin?.propertyKeysManager.accessedProperties).toHaveLength(0);

    act(() => {
      store.arr = [2, { a: 2 }] as any;
      expect(storeAdmin?.propertyKeysManager.accessedProperties.length).toBe(0);
    });
  });

  it("should collect accessed path logs if there is any autoEffect in store", () => {
    let store!: ImpureStore;

    @Store()
    class ImpureStore {
      arr: any = [1, { a: 1 }];

      constructor() {
        store = this;
      }

      @AutoEffect(true)
      arrChanged() {
        this.arr;
      }
    }

    const App = connect(() => {
      const st = useStore(ImpureStore);
      return <p>{JSON.stringify(st.arr[1].a)}</p>;
    }, ImpureStore);

    const { getByText } = render(<App />);

    expect(getByText("1")).toBeInTheDocument();
    const storeAdmin = StoreAdministrator.get(store);

    act(() => {
      store.arr[1].a = 2;
      // after first auto effect run and set arr
      expect(storeAdmin?.propertyKeysManager.accessedProperties.length).toBe(4);
    });

    expect(getByText("2")).toBeInTheDocument();
    //after second run of autoEffect
    expect(storeAdmin?.propertyKeysManager.accessedProperties.length).toBe(1);
  });

  it("should collect accessed path logs if store is injected into other store", () => {
    let injectedStore!: InjectedStore;
    let injectedStorePart!: InjectedStorePart;
    const arrChangedFn = jest.fn();
    const objChangedFn = jest.fn();

    @Store()
    class InjectedStore {
      arr = [1];

      constructor() {
        injectedStore = this;
      }
    }

    @StorePart()
    class InjectedStorePart {
      obj = { a: 1 };

      constructor() {
        injectedStorePart = this;
      }
    }

    @Store()
    class PureStore {
      @AutoWire()
      part: InjectedStorePart;

      constructor(public injectedStore: InjectedStore) {}

      @AutoEffect(true)
      arrChanged() {
        this.injectedStore.arr;
        arrChangedFn();
      }

      @AutoEffect(true)
      objChanged() {
        this.part.obj;
        objChangedFn();
      }
    }

    const App = connect(
      connect(() => {
        useStore(PureStore);
        return <></>;
      }, PureStore),
      InjectedStore
    );

    render(<App />);

    act(() => {
      injectedStore.arr = [1, 2];
    });
    expect(arrChangedFn).toBeCalledTimes(2);
    expect(StoreAdministrator.get(injectedStore)?.lastSetPaths).toStrictEqual([
      ["arr"],
    ]);
    expect(
      StoreAdministrator.get(injectedStore)?.propertyKeysManager
        .collectAccessPathLogs
    ).toBeTruthy();

    act(() => {
      injectedStorePart.obj.a = 2;
    });
    expect(arrChangedFn).toBeCalledTimes(2);
    expect(StoreAdministrator.get(injectedStorePart)?.lastSetPaths).toStrictEqual([
      ["obj", "a"],
    ]);
    expect(
      StoreAdministrator.get(injectedStorePart)?.propertyKeysManager
        .collectAccessPathLogs
    ).toBeTruthy();
  });

  it("should collect accessed path logs if there is any getter in store", () => {
    let store!: ImpureStore;

    @Store()
    class ImpureStore {
      arr = [1];

      constructor() {
        store = this;
      }

      get arrLen() {
        return this.arr.length;
      }
    }

    const App = connect(() => {
      const st = useStore(ImpureStore);
      return <p>{JSON.stringify(st.arr)}</p>;
    }, ImpureStore);

    const { getByText } = render(<App />);

    expect(getByText("[1]")).toBeInTheDocument();
    const storeAdmin = StoreAdministrator.get(store);

    act(() => {
      store.arr = [1, 2];
      // after first auto effect run and set arr
      expect(storeAdmin?.propertyKeysManager.accessedProperties.length).toBe(1);
    });
    //after second run of autoEffect
    expect(getByText("[1,2]")).toBeInTheDocument();
    expect(storeAdmin?.propertyKeysManager.accessedProperties.length).toBe(1);
  });
});
