import { connectStore, Store, Effect, useStore } from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, waitFor } from "@testing-library/react";
import React, { ChangeEvent } from "react";
import { clearContainer } from "src/container/container";

describe("Effects", () => {
  beforeEach(() => {
    clearContainer();
  });

  it("must be called when dependecies are being changed", async () => {
    const usernameChangeCallback = jest.fn();
    @Store()
    class UserStore {
      user = { name: "amir.qasemi74" };
      password = "123456";

      changeUsername(e: ChangeEvent<HTMLInputElement>) {
        this.user.name = e.target.value;
      }

      @Effect<UserStore>((_) => [_.user.name])
      onUsernameChange() {
        const username = this.user.name;
        usernameChangeCallback();
      }
    }

    const User = connectStore(() => {
      const vm = useStore(UserStore);
      return (
        <>
          {vm.user.name}
          {vm.password}
          <input
            data-testid="username-input"
            value={vm.user.name}
            onChange={vm.changeUsername}
          />
        </>
      );
    }, UserStore);

    const { findByTestId } = render(<User />);
    const input = await findByTestId("username-input");

    expect(usernameChangeCallback).toBeCalledTimes(1);

    // change username dep
    await waitFor(() => {
      fireEvent.change(input, { target: { value: "amir.qasemi70" } });
    });
    await waitFor(() => expect(usernameChangeCallback).toBeCalledTimes(2));

    // no change
    await waitFor(() => {
      fireEvent.change(input, { target: { value: "amir.qasemi70" } });
    });
    await waitFor(() => expect(usernameChangeCallback).toBeCalledTimes(2));
    // change username dep again
    await waitFor(() => {
      fireEvent.change(input, { target: { value: "amir.qasemi75" } });
    });
    await waitFor(() => expect(usernameChangeCallback).toBeCalledTimes(3));
  });

  it("clear Effect must be called before running new effect", async () => {
    const usernameChangeCallback = jest.fn();
    const usernameChangeClearEffect = jest.fn();
    const callStack: Array<"effect" | "clear-effect"> = [];

    @Store()
    class UserStore {
      username = "amir.qasemi74";
      password = "123456";

      changeUsername(e: ChangeEvent<HTMLInputElement>) {
        this.username = e.target.value;
      }

      @Effect<UserStore>((_) => [_.username])
      onUsernameChange() {
        const username = this.username;
        usernameChangeCallback();
        callStack.push("effect");
        return () => {
          callStack.push("clear-effect");
          usernameChangeClearEffect();
        };
      }
    }

    const User = connectStore(() => {
      const vm = useStore(UserStore);
      return (
        <>
          {vm.username}
          {vm.password}
          <input
            data-testid="username-input"
            value={vm.username}
            onChange={vm.changeUsername}
          />
        </>
      );
    }, UserStore);

    const { findByTestId } = render(<User />);
    const input = await findByTestId("username-input");

    expect(usernameChangeCallback).toBeCalledTimes(1);
    expect(usernameChangeClearEffect).toBeCalledTimes(0);
    expect(callStack).toEqual(["effect"]);

    // change username dep
    await waitFor(() => {
      fireEvent.change(input, { target: { value: "amir.qasemi70" } });
    });
    await waitFor(() => expect(usernameChangeCallback).toBeCalledTimes(2));
    expect(usernameChangeClearEffect).toBeCalledTimes(1);
    expect(callStack).toEqual(["effect", "clear-effect", "effect"]);

    // no change
    await waitFor(() => {
      fireEvent.change(input, { target: { value: "amir.qasemi70" } });
    });
    expect(usernameChangeCallback).toBeCalledTimes(2);
    expect(usernameChangeClearEffect).toBeCalledTimes(1);
    expect(callStack).toEqual(["effect", "clear-effect", "effect"]);

    // change username dep again
    await waitFor(() => {
      fireEvent.change(input, { target: { value: "amir.qasemi75" } });
    });
    await waitFor(() => expect(usernameChangeCallback).toBeCalledTimes(3));
    expect(usernameChangeClearEffect).toBeCalledTimes(2);
    expect(callStack).toEqual([
      "effect",
      "clear-effect",
      "effect",
      "clear-effect",
      "effect",
    ]);
  });
});
