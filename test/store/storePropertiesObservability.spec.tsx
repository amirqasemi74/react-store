import { connectStore, Store, useStore } from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";

describe("Store Properties Observability", () => {
  it("should observe primitive types", () => {
    let store!: PrimitiveTypesStore;

    @Store()
    class PrimitiveTypesStore {
      number = 1;
      string = "string";
      bigint = BigInt(11);
      boolean = false;
      undefined: any = undefined;
      symbol = Symbol("symbol1");
      null: any = null;

      changeNumber() {
        this.number = 2;
      }

      changeString() {
        this.string = "string2";
      }

      changeBigInt() {
        this.bigint = BigInt(111);
      }

      changeBoolean() {
        this.boolean = true;
      }

      changeUndefined() {
        this.undefined = "not undefined";
      }

      changeSymbol() {
        this.symbol = Symbol("symbol2");
      }

      changeNull() {
        this.null = "not null";
      }
    }

    const App: React.FC = connectStore(() => {
      const vm = useStore(PrimitiveTypesStore);
      store = vm;
      return (
        <div>
          <span>{vm.number}</span>
          <span>{vm.string}</span>
          <span>{vm.bigint.toString()}</span>
          <span>{vm.boolean.toString()}</span>
          <span>{vm.symbol.toString()}</span>
          <span>{vm.undefined}</span>
          <span>{vm.null}</span>
        </div>
      );
    }, PrimitiveTypesStore);

    render(<App />);

    // number
    expect(screen.getByText("1")).toHaveTextContent("1");
    act(() => store.changeNumber());
    expect(screen.getByText("2")).toHaveTextContent("2");

    // string
    expect(screen.getByText("string")).toHaveTextContent("string");
    act(() => store.changeString());
    expect(screen.getByText("string2")).toHaveTextContent("string2");

    // bigint
    expect(screen.getByText("11")).toHaveTextContent("11");
    act(() => store.changeBigInt());
    expect(screen.getByText("111")).toHaveTextContent("111");

    // boolean
    expect(screen.getByText("false")).toHaveTextContent("false");
    act(() => store.changeBoolean());
    expect(screen.getByText("true")).toHaveTextContent("true");

    // symbol
    expect(screen.getByText("Symbol(symbol1)")).toHaveTextContent(
      "Symbol(symbol1)"
    );
    act(() => store.changeSymbol());
    expect(screen.getByText("Symbol(symbol2)")).toHaveTextContent(
      "Symbol(symbol2)"
    );

    // undefined
    act(() => store.changeUndefined());
    expect(screen.getByText("not undefined")).toHaveTextContent(
      "not undefined"
    );

    // null
    act(() => store.changeNull());
    expect(screen.getByText("not null")).toHaveTextContent("not null");
  });

  it("should observe complex types", () => {
    let store!: ComplexTypesStore;

    @Store()
    class ComplexTypesStore {
      object = { a: 1, b: { c: 1 } };
      array = [1, 2, [3, 4]];
      nested = {
        a: [1, 2],
        c: {
          d: 1,
        },
      };
      map = new Map<string, any>();

      constructor() {
        this.map.set("a", "map");
        this.map.set("b", { map: 1 });
      }

      changeObject() {
        this.object.b.c = 2;
      }

      changeArray() {
        this.array[2][1] = 5;
      }

      changeNested() {
        this.nested.a[2] = 3;
        this.nested.c.d = 3;
      }

      changeMapAKey() {
        this.map.set("a", "map2");
      }

      changeMapBKey() {
        const b = this.map.get("b");
        b.map = 11;
      }
    }

    const App: React.FC = connectStore(() => {
      const vm = useStore(ComplexTypesStore);
      store = vm;
      return (
        <div>
          <span>{JSON.stringify(vm.object)}</span>
          <span>{JSON.stringify(vm.array)}</span>
          <span>{JSON.stringify(vm.nested)}</span>
          <span>{vm.map.get("a")}</span>
          <span>{JSON.stringify(vm.map.get("b"))}</span>
        </div>
      );
    }, ComplexTypesStore);

    render(<App />);

    // object
    expect(screen.getByText(JSON.stringify(store.object))).toHaveTextContent(
      JSON.stringify(store.object)
    );
    act(() => store.changeObject());
    expect(
      screen.getByText(JSON.stringify({ a: 1, b: { c: 2 } }))
    ).toHaveTextContent(JSON.stringify({ a: 1, b: { c: 2 } }));

    // array
    expect(screen.getByText(JSON.stringify(store.nested))).toHaveTextContent(
      JSON.stringify(store.nested)
    );
    act(() => store.changeNested());
    expect(
      screen.getByText(
        JSON.stringify({
          a: [1, 2, 3],
          c: {
            d: 3,
          },
        })
      )
    ).toHaveTextContent(
      JSON.stringify({
        a: [1, 2, 3],
        c: {
          d: 3,
        },
      })
    );

    // map
    expect(screen.getByText("map")).toHaveTextContent("map");
    act(() => store.changeMapAKey());
    expect(screen.getByText("map2")).toHaveTextContent("map2");

    expect(
      screen.getByText(JSON.stringify(store.map.get("b")))
    ).toHaveTextContent(JSON.stringify(store.map.get("b")));
    act(() => store.changeMapBKey());
    expect(screen.getByText(JSON.stringify({ map: 11 }))).toHaveTextContent(
      JSON.stringify({ map: 11 })
    );
  });

  it("should save proxy value for arrays, object, function, maps", () => {
    let store!: SavedProxiedValueStore;

    @Store()
    class SavedProxiedValueStore {
      array = [1, { a: 1 }];
      object = { a: [], b: 1 };
      map = new Map<string, any>();
      onChange() {}
    }

    const App: React.FC = connectStore(() => {
      const vm = useStore(SavedProxiedValueStore);
      store = vm;
      return <div>App</div>;
    }, SavedProxiedValueStore);

    render(<App />);

    expect(store.array).toBeDefined();
    expect(store.array).toBe(store.array);
    expect(store.object).toBeDefined();
    expect(store.object).toBe(store.object);
    expect(store.map).toBeDefined();
    expect(store.map).toBe(store.map);
    expect(store.onChange).toBeDefined();
    expect(store.onChange).toBe(store.onChange);
  });

  it("should saved proxied value be per instance of store", () => {
    let store!: SavedProxiedValueStore;

    @Store()
    class SavedProxiedValueStore {
      array = [1, { a: 1 }];
      object = { a: [], b: 1 };
      map = new Map<string, any>();
      onChange() {}
    }

    const App: React.FC = connectStore(() => {
      const vm = useStore(SavedProxiedValueStore);
      store = vm;
      return <div>App</div>;
    }, SavedProxiedValueStore);

    const { unmount } = render(<App />);

    const preArray = store.array;
    const preObject = store.object;
    const preOnChange = store.onChange;

    unmount();
    render(<App />);

    expect(store.array).not.toBe(preArray);
    expect(store.object).not.toBe(preObject);
    expect(store.onChange).not.toBe(preOnChange);
  });
});
