import { Memo, Store, connect, useStore } from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { act, render } from "@testing-library/react";
import React from "react";
import { StoreAdministrator } from "src/store/administrator/storeAdministrator";

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

    const storeAdmin = StoreAdministrator.get(storeRef)!;

    expect(getByText("amir")).toBeInTheDocument();
    expect(usernameFn).toBeCalledTimes(1);

    act(() => {
      storeRef.changeUser();
    });

    expect(getByText("reza")).toBeInTheDocument();
    expect(usernameFn).toBeCalledTimes(2);
  });
});
