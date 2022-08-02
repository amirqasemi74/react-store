import { Memo, Store, connect, useStore } from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { act, render } from "@testing-library/react";
import React from "react";

describe("Memo", () => {
  it("should compute getter if dependencies has been changed", () => {
    const usernameFn = jest.fn();
    let storeRef!: SampleStore;

    @Store()
    class SampleStore {
      private user = { username: "amir" };

      @Memo("user.username")
      get username() {
        usernameFn();
        return this.user.username;
      }

      changeUser() {
        this.user.username = "reza";
      }
    }

    const App = connect(() => {
      const st = useStore(SampleStore);
      storeRef = st;
      return (
        <>
          <span>{st.username}</span>
        </>
      );
    }, SampleStore);

    const { getByText } = render(<App />);

    expect(getByText("amir")).toBeInTheDocument();
    expect(usernameFn).toBeCalledTimes(1);

    act(() => {
      storeRef.changeUser();
    });

    expect(getByText("reza")).toBeInTheDocument();
    expect(usernameFn).toBeCalledTimes(2);
  });

  it("should not compute getter if object dependencies has not changed", () => {
    const usernameFn = jest.fn();
    let storeRef!: SampleStore;

    @Store()
    class SampleStore {
      private user = { username: "amir" };

      @Memo("user")
      get username() {
        usernameFn();
        return this.user.username;
      }

      changeUser() {
        this.user.username = "reza";
      }
    }

    const App = connect(() => {
      const st = useStore(SampleStore);
      storeRef = st;
      return (
        <>
          <span>{st.username}</span>
        </>
      );
    }, SampleStore);

    const { getByText } = render(<App />);

    expect(getByText("amir")).toBeInTheDocument();
    expect(usernameFn).toBeCalledTimes(1);

    act(() => {
      storeRef.changeUser();
    });

    expect(getByText("amir")).toBeInTheDocument();
    expect(usernameFn).toBeCalledTimes(1);
  });

  it("should compute getter in deep mode", () => {
    const usernameFn = jest.fn();
    let storeRef!: SampleStore;

    @Store()
    class SampleStore {
      private user = { username: "amir" };

      @Memo("user", true)
      get username() {
        usernameFn();
        return this.user.username;
      }

      changeUser() {
        this.user.username = "reza";
      }
    }

    const App = connect(() => {
      const st = useStore(SampleStore);
      storeRef = st;
      return (
        <>
          <span>{st.username}</span>
        </>
      );
    }, SampleStore);

    const { getByText } = render(<App />);

    expect(getByText("amir")).toBeInTheDocument();
    expect(usernameFn).toBeCalledTimes(1);

    act(() => {
      storeRef.changeUser();
    });

    expect(getByText("amir")).toBeInTheDocument();
    expect(usernameFn).toBeCalledTimes(1);
  });
});
