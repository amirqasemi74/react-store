import { connectStore, Effect, Store, StorePart, useStore } from "@react-store/core";
import { fireEvent, render } from "@testing-library/react";
import React from "react";
import { IS_PROXIED } from "src/constant";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";

export const storePartTests = () => {
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
      validator = new Validator();
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
    const AppWithStore = connectStore(App, UserStore);
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
      validator = new Validator();
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
    const AppWithStore = connectStore(App, UserStore);
    const { getByText } = render(<AppWithStore />);

    fireEvent.click(getByText(/Create Error/i));
    expect(hasErrorChanged).toBeCalledTimes(2);
  });

  it("should can't set store part property key", () => {
    let pre, post;

    @StorePart()
    class Validator {}

    @Store()
    class UserStore {
      validator = new Validator();

      resetStorePart() {
        this.validator = "sdf";
        post = this.validator;
      }
    }

    const App = () => {
      const vm = useStore(UserStore);
      if (!pre) pre = vm.validator;
      return (
        <>
          <button onClick={vm.resetStorePart}>Reset</button>
        </>
      );
    };
    const AppWithStore = connectStore(App, UserStore);
    const { getByText } = render(<AppWithStore />);

    fireEvent.click(getByText(/Reset/i));

    expect(pre).toBeDefined();
    expect(post).toBeDefined();
    expect(pre).toBe(post);
  });

  it("should not be observable the store part in store propertyKey", () => {
    let validator;
    @StorePart()
    class Validator {}

    @Store()
    class UserStore {
      validator = new Validator();
    }

    const App = () => {
      const vm = useStore(UserStore);
      validator = vm.validator;
      return <></>;
    };
    const AppWithStore = connectStore(App, UserStore);
    render(<AppWithStore />);

    expect(validator[IS_PROXIED]).toBeFalsy();
  });
};
