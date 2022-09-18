import {
  AutoWire,
  Effect,
  Store,
  StorePart,
  connect,
  useStore,
} from "@react-store/core";
import { render, waitFor } from "@testing-library/react";
import React from "react";

describe("Methods Auto Bind", () => {
  it("should auto bind store methods", () => {
    let store!: MethodsStore;

    @StorePart()
    class MethodsStorePart {
      a = 1;
      b() {
        return this.a;
      }
    }
    @Store()
    class MethodsStore {
      @AutoWire()
      part: MethodsStorePart;

      c = 2;
      d() {
        return this.c;
      }
    }

    const App = connect(() => {
      store = useStore(MethodsStore);
      return <></>;
    }, MethodsStore);

    render(<App />);

    const d = store.d;
    expect(d()).toBe(2);

    const b = store.part.b;
    expect(b()).toBe(1);
  });

  it("should auto bind overridden method", () => {
    let store!: MethodsStore;

    @Store()
    class BaseMethodsStore {
      a = 3;
      method() {
        return this.a;
      }
    }

    @Store()
    class MethodsStore extends BaseMethodsStore {
      b = 2;
      method() {
        const res = super.method();
        return this.b * res;
      }
    }

    const App = connect(() => {
      store = useStore(MethodsStore);
      return <></>;
    }, MethodsStore);

    render(<App />);

    expect(store.method()).toBe(6);
  });

  it("should bind methods inside store class", async () => {
    @Store()
    class UserStore {
      username = "amir";

      changeUsername() {
        this.username = "reza";
      }

      @Effect([])
      onMount() {
        setTimeout(this.changeUsername, 0);
      }
    }

    const User = connect(() => {
      const st = useStore(UserStore);

      return <>{st.username}</>;
    }, UserStore);

    const { getByText } = render(<User />);

    expect(getByText("amir")).toBeInTheDocument();

    await waitFor(() => expect(getByText("reza")).toBeInTheDocument());
  });

  it("should bind store methods to store context even if method called with other context", () => {
    let store!: MethodsStore;
    @Store()
    class MethodsStore {
      c = 2;

      d() {
        return this.c;
      }
    }

    const App = connect(() => {
      store = useStore(MethodsStore);
      return <></>;
    }, MethodsStore);

    render(<App />);

    const d = store.d;
    expect(d.apply({ c: 4 })).toBe(2);
  });
});
