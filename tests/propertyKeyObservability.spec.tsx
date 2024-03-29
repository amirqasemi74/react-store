import {
  Effect,
  Injectable,
  Observable,
  Store,
  Unobserve,
  connect,
  useStore,
} from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";

describe("Property Keys Observability", () => {
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

    const App: React.FC = connect(() => {
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
    expect(screen.getByText("Symbol(symbol1)")).toHaveTextContent("Symbol(symbol1)");
    act(() => store.changeSymbol());
    expect(screen.getByText("Symbol(symbol2)")).toHaveTextContent("Symbol(symbol2)");

    // undefined
    act(() => store.changeUndefined());
    expect(screen.getByText("not undefined")).toHaveTextContent("not undefined");

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
        store = this;
      }
      @Effect([])
      onMount() {
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

    const App: React.FC = connect(() => {
      const vm = useStore(ComplexTypesStore);
      return (
        <div>
          <span>{JSON.stringify(vm.object)}</span>
          <span>{JSON.stringify(vm.array)}</span>
          <span>{JSON.stringify(vm.nested)}</span>
          <span>{vm.map.get("a")}</span>
          <span>{JSON.stringify(vm.map.get("b"))}</span>
          <span>Map Size: {vm.map.size}</span>
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

    expect(screen.getByText(JSON.stringify(store.map.get("b")))).toHaveTextContent(
      JSON.stringify(store.map.get("b"))
    );
    act(() => store.changeMapBKey());
    expect(screen.getByText(JSON.stringify({ map: 11 }))).toHaveTextContent(
      JSON.stringify({ map: 11 })
    );
  });

  it("should observe the observable classes", () => {
    @Observable()
    class User {
      username = "amir";
    }

    @Store()
    class UserStore {
      user = new User();

      changeUsername() {
        this.user.username = "amirhossein";
      }
    }

    const App: React.FC = connect(() => {
      const vm = useStore(UserStore);
      return (
        <div>
          {vm.user.username}
          <button onClick={vm.changeUsername}>change</button>
        </div>
      );
    }, UserStore);

    const { getByText } = render(<App />);
    expect(getByText("amir")).toBeInTheDocument();
    fireEvent.click(getByText("change"));
    expect(getByText("amirhossein")).toBeInTheDocument();
  });

  it("should save proxy value for arrays, objects, functions, maps", () => {
    let store!: SavedProxiedValueStore;

    @Store()
    class SavedProxiedValueStore {
      array = [1, { a: 1 }];
      object = { a: [2, 3, 4], b: 1 };
      map = new Map<string, any>();

      constructor() {
        store = this;
      }
      onChange() {}
    }

    const App: React.FC = connect(() => {
      useStore(SavedProxiedValueStore);
      return <div>App</div>;
    }, SavedProxiedValueStore);

    render(<App />);

    expect(store.array).toBeDefined();
    act(() => {
      // make array [1, Proxy] to check cache proxied
      store.array = store.array.map((i) => i);
    });

    // Here we check for cache proxied
    expect(store.array[1]).toBe(store.array[1]);

    expect(store.object).toBeDefined();
    expect(store.object.a).toBe(store.object.a);
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

    const App: React.FC = connect(() => {
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

  it("should rerender if primitive store property change to non one or vice versa", () => {
    let store!: PropertyTypesStore;
    let renderCount = 0;
    @Store()
    class PropertyTypesStore {
      undefinedToObject?: any;

      objectToUndefined?: any = {};

      constructor() {
        store = this;
      }
    }

    const App: React.FC = connect(() => {
      const vm = useStore(PropertyTypesStore);
      renderCount++;
      return (
        <div>
          <span>{JSON.stringify(vm.objectToUndefined)}</span>
          <span>{JSON.stringify(vm.undefinedToObject)}</span>
        </div>
      );
    }, PropertyTypesStore);

    render(<App />);

    expect(renderCount).toBe(1);

    act(() => {
      store.objectToUndefined = undefined;
    });

    expect(renderCount).toBe(2);

    act(() => {
      store.undefinedToObject = {};
    });

    expect(renderCount).toBe(3);
  });

  describe("Same value assignment to observable properties", () => {
    it("should not rerender on set same value for primitive types", () => {
      let store!: PrimitiveTypesStore;
      let renderCount = 0;
      @Store()
      class PrimitiveTypesStore {
        number = 1;

        constructor() {
          store = this;
        }
      }

      const App: React.FC = connect(() => {
        const vm = useStore(PrimitiveTypesStore);
        renderCount++;
        return (
          <div>
            <span>{vm.number}</span>
          </div>
        );
      }, PrimitiveTypesStore);

      render(<App />);

      act(() => {
        store.number = 1;
      });

      expect(renderCount).toBe(1);
    });

    it("should not rerender on set same value for non-primitive types", () => {
      let store!: NonPrimitiveTypesStore;
      let renderCount = 0;
      const constObj = { a: 1 };
      const constArr = [1];
      @Store()
      class NonPrimitiveTypesStore {
        object = constObj;
        array = constArr;

        constructor() {
          store = this;
        }
      }

      const App: React.FC = connect(() => {
        const vm = useStore(NonPrimitiveTypesStore);
        renderCount++;
        return (
          <div>
            <span>{JSON.stringify(vm.object)}</span>
            <span>{JSON.stringify(vm.array)}</span>
          </div>
        );
      }, NonPrimitiveTypesStore);

      render(<App />);

      act(() => {
        store.object = constObj;
      });
      act(() => {
        store.array = constArr;
      });

      expect(renderCount).toBe(1);
    });
  });

  it("should unobserve store property key", () => {
    let store!: UserStore;
    let renderCount = 0;
    @Store()
    class UserStore {
      @Unobserve()
      username = "amir";

      changeUsername() {
        this.username = "reza";
      }
    }

    const App = connect(() => {
      const st = useStore(UserStore);
      store = st;
      renderCount++;
      return <>{st.username}</>;
    }, UserStore);

    const { getByText } = render(<App />);

    expect(getByText("amir")).toBeInTheDocument();
    act(() => store.changeUsername());
    expect(getByText("amir")).toBeInTheDocument();
    expect(renderCount).toBe(1);
  });

  describe("Readonly Store Class Properties", () => {
    it("should inject stores as readonly class property", () => {
      let lowerStore!: LowerStore;

      @Store()
      class UpperStore {}

      @Store()
      class LowerStore {
        constructor(public upperStore: UpperStore) {
          lowerStore = this;
        }
      }

      const App = connect(
        connect(() => {
          useStore(LowerStore);
          return <>App</>;
        }, LowerStore),
        UpperStore
      );

      render(<App />);
      expect(lowerStore.upperStore).toBe(getUnproxiedValue(lowerStore.upperStore));
    });

    it("should inject Injectable as readonly class property", () => {
      let store!: UserStore;

      @Injectable()
      class UserService {}

      @Store()
      class UserStore {
        constructor(public userService: UserService) {
          store = this;
        }
      }

      const App = connect(() => {
        useStore(UserStore);
        return <>App</>;
      }, UserStore);

      render(<App />);
      expect(store.userService).toBe(getUnproxiedValue(store.userService));
    });
  });

  describe("Deep Full Unproxy", () => {
    it("should deep full unproxy value when assigns to store class property", () => {
      let upperStore!: UpperStore;
      let lowerStore!: LowerStore;

      @Store()
      class UpperStore {
        user = { username: "amir", password: "1234" };

        constructor() {
          upperStore = this;
        }

        changeUser(user: any) {
          this.user = user;
        }
      }

      @Store()
      class LowerStore {
        user = { username: "reza", password: "4321" };

        constructor(public upperStore: UpperStore) {
          lowerStore = this;
        }
      }

      const LowerCmp = connect(() => {
        const lst = useStore(LowerStore);
        return <>{JSON.stringify(lst.user)}</>;
      }, LowerStore);

      const App = connect(() => {
        useStore(UpperStore);
        return <LowerCmp />;
      }, UpperStore);

      render(<App />);

      act(() => {
        lowerStore.upperStore.changeUser(lowerStore.user);
      });

      expect(getUnproxiedValue(upperStore.user)).toBe(
        getUnproxiedValue(getUnproxiedValue(upperStore.user))
      );
    });

    it("should deep full unproxy on set array element", () => {
      let store!: ArrayStore;

      @Store()
      class ArrayStore {
        obj = { a: 1 };

        array: any = [0];
        constructor() {
          store = this;
        }
      }

      const App = connect(() => <>App</>, ArrayStore);

      render(<App />);

      act(() => {
        store.array[1] = store.obj;
      });

      expect(getUnproxiedValue(store.array[1])).toBe(
        getUnproxiedValue(getUnproxiedValue(store.array[1]))
      );
    });

    it("should deep full unproxy on set object property", () => {
      let store!: ArrayStore;

      @Store()
      class ArrayStore {
        obj = { a: 1 };

        array: any = [0];
        constructor() {
          store = this;
        }
      }

      const App = connect(() => <>App</>, ArrayStore);

      render(<App />);

      act(() => {
        store.obj.a = store.array;
      });

      expect(getUnproxiedValue(store.obj.a)).toBe(
        getUnproxiedValue(getUnproxiedValue(store.obj.a))
      );
    });
  });
});
