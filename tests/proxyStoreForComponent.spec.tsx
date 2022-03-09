import { AutoWire, Store, StorePart, connect, useStore } from "@react-store/core";
import { act, render } from "@testing-library/react";
import React from "react";
import { PROXY_HANDLER_TYPE, TARGET } from "src/constant";
import { StoreForConsumerComponentProxy } from "src/proxy/storeForConsumerComponentProxy";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";

describe("Proxy Store For Consumers Component", () => {
  it("should log an error if direct store property mutated in component body", () => {
    let store!: TestStore;
    const errorMock = jest.spyOn(console, "error").mockImplementation();

    @Store()
    class TestStore {
      val = 1;
    }

    const App = connect(() => {
      store = useStore(TestStore);
      return <p>{store.val}</p>;
    }, TestStore);

    const { getByText } = render(<App />);

    act(() => {
      store.val = 2;
    });

    expect(errorMock).toBeCalledWith(
      "Mutating (TestStore.val) store properties from outside of store class is not valid."
    );
    expect(getByText("1")).toBeInTheDocument();
  });

  it("should not render if store property deep path set", () => {
    let store!: TestStore;
    @Store()
    class TestStore {
      val = [1];
    }

    const App = connect(() => {
      store = useStore(TestStore);
      return <p>{JSON.stringify(store.val)}</p>;
    }, TestStore);

    const { getByText } = render(<App />);

    act(() => {
      store.val[0] = 2;
    });
    expect(getByText("[1]")).toBeInTheDocument();
    expect(store.val[0]).toBe(2);
  });

  it("should return unproxied value for store property", () => {
    let store!: TestStore;
    @Store()
    class TestStore {
      val = [1, { a: 1 }];
    }

    const App = connect(() => {
      store = useStore(TestStore);
      return <p>{JSON.stringify(store.val)}</p>;
    }, TestStore);

    render(<App />);

    expect(store.val[TARGET]).toBeUndefined();
    expect(store.val[1][TARGET]).toBeUndefined();
  });

  it("should return unproxied value for wired store part properties", () => {
    let store!: TestStore;

    @StorePart()
    class TestStorePart {
      val = [1, { a: 1 }];
    }

    @Store()
    class TestStore {
      @AutoWire()
      part: TestStorePart;

      get arrLen() {
        return this.part.val.length;
      }
    }

    const App = connect(() => {
      store = useStore(TestStore);
      return <p>{JSON.stringify(store.part.val)}</p>;
    }, TestStore);

    render(<App />);

    expect(store.part[TARGET]).toBeUndefined();
    expect(store.part[PROXY_HANDLER_TYPE]).toBe(StoreForConsumerComponentProxy);
    expect(store.part.val[TARGET]).toBeUndefined();
    expect(store.part.val[1][TARGET]).toBeUndefined();
    expect(
      StoreAdministrator.get(store)?.propertyKeysManager.accessedProperties
    ).toHaveLength(0);
    expect(
      StoreAdministrator.get(store.part)?.propertyKeysManager.accessedProperties
    ).toHaveLength(0);
  });
});
