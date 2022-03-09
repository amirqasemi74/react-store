import {
  AutoWire,
  Effect,
  Injectable,
  Store,
  StorePart,
  connect,
  useStore,
} from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render } from "@testing-library/react";
import React from "react";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";
import { getUnproxiedValue } from "src/utils/getUnProxiedValue";

describe("Store Parts", () => {
  it("should store part state change rerender it's consumers", () => {
    let storePartRef: Validator | null = null;

    @StorePart()
    class Validator {
      hasError = false;

      setHasError(has: boolean) {
        this.hasError = has;
      }
    }

    @Store()
    class UserStore {
      username = "amirhossein";

      @AutoWire()
      validator: Validator;
    }

    const App = () => {
      const vm = useStore(UserStore);
      storePartRef = vm.validator;
      return (
        <>
          <p>{vm.username}</p>
          <button onClick={() => vm.validator.setHasError(true)}>
            Create Error
          </button>
          <span>{vm.validator.hasError ? "Has Error" : "No Error"}</span>
        </>
      );
    };
    const AppWithStore = connect(App, UserStore);
    const { getByText } = render(<AppWithStore />);

    fireEvent.click(getByText(/Create Error/i));
    expect(StoreAdministrator.get(storePartRef!)?.type.name).toBe(Validator.name);
    expect(getByText(/Has Error/i)).toBeInTheDocument();
  });

  it("should run store part effects", () => {
    let hasErrorChanged = jest.fn();

    @StorePart()
    class Validator {
      hasError = false;

      setHasError(has: boolean) {
        this.hasError = has;
      }

      @Effect<Validator>(($) => [$.hasError])
      onHasErrorChange() {
        hasErrorChanged();
      }
    }

    @Store()
    class UserStore {
      username = "amirhossein";
      @AutoWire()
      validator: Validator;
    }

    const App = () => {
      const vm = useStore(UserStore);
      return (
        <>
          <p>{vm.username}</p>
          <button onClick={() => vm.validator.setHasError(true)}>
            Create Error
          </button>
          <span>{vm.validator.hasError ? "Has Error" : "No Error"}</span>
        </>
      );
    };
    const AppWithStore = connect(App, UserStore);
    const { getByText } = render(<AppWithStore />);

    fireEvent.click(getByText(/Create Error/i));
    expect(hasErrorChanged).toBeCalledTimes(2);
  });

  it("should store @Wire property be read only", () => {
    const errorMock = jest.spyOn(console, "error").mockImplementation();
    let pre, post;
    let store!: UserStore;
    @StorePart()
    class Validator {}

    @Store()
    class UserStore {
      @AutoWire()
      validator: Validator;

      resetStorePart() {
        this.validator = "sdf";
        post = this.validator;
      }
    }

    const App = () => {
      const vm = useStore(UserStore);
      store = vm;
      if (!pre) pre = vm.validator;
      return (
        <>
          <button onClick={vm.resetStorePart}>Reset</button>
        </>
      );
    };
    const AppWithStore = connect(App, UserStore);
    const { getByText } = render(<AppWithStore />);

    fireEvent.click(getByText(/Reset/i));

    expect(pre).toBeDefined();
    expect(post).toBeDefined();

    expect(pre.constructor === post.constructor).toBeTruthy();
    expect(errorMock).toHaveBeenLastCalledWith(
      "`UserStore.validator` is decorated with `@Wire(...)` or `@AutoWire()`, so can't be mutated."
    );
    expect(
      StoreAdministrator.get(store)!.propertyKeysManager.propertyKeys.get(
        "validator"
      )?.isReadOnly
    ).toBeTruthy();
  });

  it("should inject dependencies", () => {
    let lowerStoreRef!: LowerStore;

    @Injectable()
    class A {}

    @Store()
    class UpperStore {}

    @StorePart()
    class BStorePart {
      message = "hi";
      constructor(public upperStore: UpperStore, public a: A) {}
    }
    @Store()
    class LowerStore {
      @AutoWire()
      part: BStorePart;
    }

    const App = connect(
      connect(() => {
        const st = useStore(LowerStore);
        lowerStoreRef = st;
        return <>{st.part.message}</>;
      }, LowerStore),
      UpperStore
    );

    render(<App />);

    expect(lowerStoreRef.part.a).toBeInstanceOf(A);
    expect(lowerStoreRef.part.upperStore).toBeInstanceOf(UpperStore);
  });
});
