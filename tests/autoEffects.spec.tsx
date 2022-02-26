import {
  AutoEffect,
  AutoWire,
  Props,
  Store,
  StorePart,
  connect,
  useStore,
} from "@react-store/core";
import { render } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";

describe("Auto Effect", () => {
  it("should run auto effect method", () => {
    let store!: AutoEffectStore;
    const onAutoEffectCalled = jest.fn();
    @Store()
    class AutoEffectStore {
      user = { name: "sdf", pass: "123" };

      @AutoEffect()
      fn() {
        this.user.name;
        this.user.pass;
        onAutoEffectCalled();
      }
    }

    const App = connect(() => {
      const vm = useStore(AutoEffectStore);
      store = vm;
      return <></>;
    }, AutoEffectStore);

    render(<App />);

    expect(
      StoreAdministrator.get(store).effectsManager.effects.get("fn")?.deps
    ).toStrictEqual([
      ["user", "name"],
      ["user", "pass"],
    ]);

    expect(onAutoEffectCalled).toBeCalledTimes(1);
    act(() => {
      store.user.name = "amir";
    });
    expect(onAutoEffectCalled).toBeCalledTimes(2);

    act(() => {
      store.user.pass = "321";
    });
    expect(onAutoEffectCalled).toBeCalledTimes(3);
  });

  it("should run with deep equal", () => {
    let store!: AutoEffectStore;
    const onAutoEffectCalled = jest.fn();

    @Store()
    class AutoEffectStore {
      user = { name: "sdf", pass: "123" };

      @AutoEffect(true)
      fn() {
        this.user;
        onAutoEffectCalled();
      }
    }

    const App = connect(() => {
      const vm = useStore(AutoEffectStore);
      store = vm;
      return <></>;
    }, AutoEffectStore);

    render(<App />);

    expect(onAutoEffectCalled).toBeCalledTimes(1);
    act(() => {
      store.user.name = "amir";
    });
    expect(onAutoEffectCalled).toBeCalledTimes(2);

    act(() => {
      store.user = { ...store.user };
    });
    expect(onAutoEffectCalled).toBeCalledTimes(2);
  });

  it("should not assume the get path as dependency if the path is set before it is get", () => {
    let store!: AutoEffectStore;
    const effectCB = jest.fn();

    @Store()
    class AutoEffectStore {
      a = 3;

      b = 4;

      c = 5;

      @AutoEffect()
      fn() {
        this.a = 5;
        this.b = this.a;
        this.c;
        effectCB();
      }
    }

    const App = connect(() => {
      const vm = useStore(AutoEffectStore);
      store = vm;
      return <></>;
    }, AutoEffectStore);

    render(<App />);

    expect(
      StoreAdministrator.get(store).effectsManager.effects.get("fn")?.deps
    ).toStrictEqual([["c"]]);

    expect(effectCB).toBeCalledTimes(1);

    act(() => {
      store.a = 1;
    });
    expect(effectCB).toBeCalledTimes(1);
  });

  it("should detect some general case dependencies", () => {
    let store!: AutoEffectStore;
    @Store()
    class AutoEffectStore {
      a = 4;
      b = 3;
      c: any = [1, 2, 3, { a: 1 }];
      d = { e: 5 };

      arrB: any = [
        { v: 1 },
        { v: 2 },
        { v: 3 },
        { v: 4 },
        { v: 5 },
        { v: 6 },
        { v: 7 },
      ];

      user = { name: "sdf", pass: "123" };

      @AutoEffect()
      fn1() {
        this.a = 3;
        this.b = this.a;
        this.c[this.b].a = 45;
        this.c[3];
        this.d.e;
      }

      @AutoEffect()
      fn2() {
        this.d.toString();
      }

      @AutoEffect()
      fn3() {
        this.arrB.filter((e) => e.v > 3).length;
      }

      @AutoEffect()
      fn4() {
        this.user.name;
        this.user = { ...this.user };
      }
    }

    const App = connect(() => {
      const vm = useStore(AutoEffectStore);
      store = vm;
      return <>{vm.arrB.length}</>;
    }, AutoEffectStore);

    render(<App />);

    const effects = StoreAdministrator.get(store).effectsManager.effects;

    expect(effects.get("fn1")?.deps).toStrictEqual([
      ["c", "3"],
      ["d", "e"],
    ]);

    expect(effects.get("fn2")?.deps).toStrictEqual([["d"]]);

    expect(effects.get("fn3")?.deps).toStrictEqual([["arrB"]]);

    expect(effects.get("fn4")?.deps).toStrictEqual([
      ["user", "name"],
      ["user", "pass"],
    ]);
  });

  it("should detect @Props paths as dependency", () => {
    let store!: PropsAutoEffectStore;
    const effectCalled = jest.fn();
    @Store()
    class PropsAutoEffectStore {
      @Props()
      props: any;

      @AutoEffect()
      propEffect() {
        this.props.a;
        this.props.obj.b;
        this.props.arr[1];
        effectCalled();
      }
    }

    const App: any = connect(() => {
      const vm = useStore(PropsAutoEffectStore);
      store = vm;
      return <>{JSON.stringify(vm.props)}</>;
    }, PropsAutoEffectStore);

    const props = { a: 1, obj: { b: 1 }, arr: [1, 2, 3] };

    const { rerender } = render(<App {...props} />);

    expect(effectCalled).toBeCalledTimes(1);

    expect(
      StoreAdministrator.get(store).effectsManager.effects.get("propEffect")?.deps
    ).toStrictEqual([
      ["props", "a"],
      ["props", "obj", "b"],
      ["props", "arr", "1"],
    ]);

    props.a = 2;
    rerender(<App {...props} />);
    expect(effectCalled).toBeCalledTimes(2);

    props.obj.b = 2;
    rerender(<App {...props} />);
    expect(effectCalled).toBeCalledTimes(3);

    props.arr[1] = 22;
    rerender(<App {...props} />);
    expect(effectCalled).toBeCalledTimes(4);

    props.arr[0] = 22;
    rerender(<App {...props} />);
    expect(effectCalled).toBeCalledTimes(4);
  });

  it("should detect store part path as dependency", () => {
    let store!: PropsAutoEffectStore;
    const effectCalled = jest.fn();

    @StorePart()
    class StorePartTest {
      obj = { a: 1 };
    }

    @Store()
    class PropsAutoEffectStore {
      @AutoWire()
      sp: StorePartTest;

      @AutoEffect()
      effectSp() {
        this.sp.obj.a;
        effectCalled();
      }
    }

    const App: any = connect(() => {
      const vm = useStore(PropsAutoEffectStore);
      store = vm;
      return <>{JSON.stringify(vm.sp.obj)}</>;
    }, PropsAutoEffectStore);

    render(<App />);

    expect(effectCalled).toBeCalledTimes(1);

    expect(
      StoreAdministrator.get(store).effectsManager.effects.get("effectSp")?.deps
    ).toStrictEqual([["sp", "obj", "a"]]);

    act(() => {
      store.sp.obj.a = 2;
    });
    expect(effectCalled).toBeCalledTimes(2);

    act(() => {
      store.sp.obj = { a: 4 };
    });
    expect(effectCalled).toBeCalledTimes(3);
  });
});
