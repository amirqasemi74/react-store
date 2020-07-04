import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor } from "@testing-library/react";
import React, { ChangeEvent } from "react";
import { connectToStore, ContextStore, Effect, useStore } from "react-over";

describe("Effects", () => {
  it("must be called when dependecies are being changed", async () => {
    const usernameChangeCallback = jest.fn();

    @ContextStore()
    class AppStore {
      theme = "black";
    }

    @ContextStore()
    class UserStore {
      username = "amir.qasemi74";
      password = "123456";

      constructor(public app: AppStore) {}

      changeUsername(e: ChangeEvent<HTMLInputElement>) {
        this.username = e.target.value;
      }

      @Effect()
      async onUsernameChange() {
        const username = this.username;
        usernameChangeCallback();
      }
    }

    const User = connectToStore(() => {
      const vm = useStore(UserStore);
      return (
        <>
          {vm.username}
          {vm.password}
          {vm.app.theme}
          <input
            data-testid="username-input"
            value={vm.username}
            onChange={vm.changeUsername}
          />
        </>
      );
    }, UserStore);

    const App = () => {
      return <User />;
    };

    const AppWithStore = connectToStore(App, AppStore);
    const { findByTestId } = render(<AppWithStore />);
    const input = await findByTestId("username-input");

    expect(usernameChangeCallback).toBeCalledTimes(1);

    // change username dep
    await waitFor(() => {
      fireEvent.change(input, { target: { value: "amir.qasemi70" } });
    });
    expect(usernameChangeCallback).toBeCalledTimes(2);

    // no change
    await waitFor(() => {
      fireEvent.change(input, { target: { value: "amir.qasemi70" } });
    });
    expect(usernameChangeCallback).toBeCalledTimes(2);

    // change username dep again
    await waitFor(() => {
      fireEvent.change(input, { target: { value: "amir.qasemi74" } });
    });
    expect(usernameChangeCallback).toBeCalledTimes(3);
  });
});
