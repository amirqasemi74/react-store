import { Effect, Props, Store, connect, useStore } from "@react-store/core";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import { ReadonlyProperty } from "src/store/administrator/propertyKeys/readonlyProperty";
import { StoreAdministrator } from "src/store/administrator/storeAdministrator";

describe("Props Decorator", () => {
  it("should parent component have props directly", () => {
    let props!: any;
    @Store()
    class UserStore {}

    const App: React.FC<{ username: string }> = connect((_props) => {
      useStore(UserStore);
      props = _props;
      return <>store</>;
    }, UserStore);

    render(<App username="amir" />);
    expect(props.username).toBe("amir");
  });

  it("should connect props to store instance", () => {
    let userStoreFromUse!: UserStore;
    let userStoreFromThis!: UserStore;
    @Store()
    class UserStore {
      @Props()
      props: any;
      constructor() {
        userStoreFromThis = this;
      }
    }

    const App: React.FC<{ username: string }> = connect(() => {
      userStoreFromUse = useStore(UserStore);
      return <>store</>;
    }, UserStore);

    render(<App username="amir" />);

    expect(userStoreFromThis.props.username).toBe("amir");
    expect(userStoreFromUse.props.username).toBe("amir");
  });

  it("should effect be called on props change", () => {
    const effectCalled = jest.fn();
    @Store()
    class UserStore {
      @Props()
      props: any;

      @Effect("props.username")
      onPropUsernameChange() {
        effectCalled(this.props);
      }
    }

    const App: React.FC<{ username: string }> = connect((props) => {
      return (
        <>
          <span>{props.username}</span>
        </>
      );
    }, UserStore);

    const { getByText, rerender } = render(<App username="amir" />);

    expect(getByText("amir")).toBeInTheDocument();
    expect(effectCalled).toBeCalledTimes(1);
    expect(effectCalled).toBeCalledWith(
      expect.objectContaining({ username: "amir" })
    );

    rerender(<App username="amirhossein" />);
    expect(getByText("amirhossein")).toBeInTheDocument();
    expect(effectCalled).toBeCalledTimes(2);
    expect(effectCalled).toBeCalledWith(
      expect.objectContaining({ username: "amirhossein" })
    );
  });

  it("should render component which use props if props change", () => {
    @Store()
    class UserStore {
      @Props()
      props: any;
    }

    const Username = React.memo(() => {
      const st = useStore(UserStore);
      return <p>{st.props.username}</p>;
    });

    const App: React.FC<{ username: string }> = connect(() => {
      return <Username />;
    }, UserStore);

    const { getByText, rerender } = render(<App username="amir" />);

    expect(getByText("amir")).toBeInTheDocument();

    rerender(<App username="amirhossein" />);

    expect(getByText("amirhossein")).toBeInTheDocument();
  });

  it("should @Props property key be readonly", () => {
    let store!: UserStore;
    const errorMock = jest.spyOn(console, "error").mockImplementation();
    @Store()
    class UserStore {
      @Props()
      props: any;

      constructor() {
        store = this;
      }
    }

    const App: React.FC<{ username: string }> = connect(() => {
      useStore(UserStore);
      return <>store</>;
    }, UserStore);

    render(<App username="amir" />);

    expect(
      StoreAdministrator.get(store)!.propertyKeysManager.propertyKeys.get("props")
    ).toBeInstanceOf(ReadonlyProperty);

    act(() => {
      store.props = {};
    });
    expect(errorMock).toBeCalledWith(
      "`UserStore.props` is decorated with `@Props()`, so can't be mutated."
    );
  });
});
