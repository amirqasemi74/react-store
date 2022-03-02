import { Effect, Observable, Store, connect, useStore } from "@react-store/core";
import { fireEvent, render, waitFor } from "@testing-library/react";
import React, { ChangeEvent } from "react";
import { act } from "react-dom/test-utils";
import { clearContainer } from "src/container/container";

describe("Effects", () => {
  beforeEach(() => {
    clearContainer();
  });

  it("should effect be called on each render", async () => {
    let userStore!: UserStore;
    const usernameChangeCallback = jest.fn();
    @Store()
    class UserStore {
      username = "1";

      @Effect()
      onUsernameChange() {
        usernameChangeCallback();
      }
    }

    const User = connect(() => {
      const vm = useStore(UserStore);
      userStore = vm;
      return <>{vm.username}</>;
    }, UserStore);

    render(<User />);

    expect(usernameChangeCallback).toBeCalledTimes(1);

    act(() => {
      userStore.username = "2";
    });
    expect(usernameChangeCallback).toBeCalledTimes(2);

    act(() => {
      userStore.username = "3";
    });
    expect(usernameChangeCallback).toBeCalledTimes(3);
  });

  it("should effect be called when dependencies are being changed", async () => {
    const usernameChangeCallback = jest.fn();
    @Store()
    class UserStore {
      user = { name: "amir.qasemi74" };
      password = "123456";

      @Effect<UserStore>((_) => [_.user.name])
      onUsernameChange() {
        this.user.name;
        this.password;
        usernameChangeCallback();
      }

      changeUsername(e: ChangeEvent<HTMLInputElement>) {
        this.user.name = e.target.value;
      }
    }

    const User = connect(() => {
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

  it("should call clear Effect before running new effect", async () => {
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
        usernameChangeCallback();
        callStack.push("effect");
        return () => {
          callStack.push("clear-effect");
          usernameChangeClearEffect();
        };
      }
    }

    const User = connect(() => {
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

  it("should run effect for observable class instance change in deep equal mode", async () => {
    @Observable()
    class User {
      name = "amir.qasemi74";
    }

    const onUserChangeCB = jest.fn();
    @Store()
    class UserStore {
      user = new User();

      changeUsername(e: ChangeEvent<HTMLInputElement>) {
        this.user.name = e.target.value;
      }

      @Effect<UserStore>((_) => [_.user], true)
      onUserChange() {
        onUserChangeCB();
      }
    }

    const App = connect(() => {
      const vm = useStore(UserStore);
      return (
        <>
          {vm.user.name}
          <input
            data-testid="username-input"
            value={vm.user.name}
            onChange={vm.changeUsername}
          />
        </>
      );
    }, UserStore);

    const { getByTestId } = render(<App />);

    expect(onUserChangeCB).toBeCalledTimes(1);

    fireEvent.change(getByTestId("username-input"), {
      target: { value: "amir.qasemi70" },
    });
    expect(onUserChangeCB).toBeCalledTimes(2);
  });

  it("should can pass effect deps as array of string object path", () => {
    const onMountChangeCB = jest.fn();
    const onUserChangeCB = jest.fn();
    const onUsernameChangeCB = jest.fn();
    const onUsernameDepAsStringChangeCB = jest.fn();
    @Store()
    class UserStore {
      user = { name: "sdf" };

      changeUsername(e: ChangeEvent<HTMLInputElement>) {
        this.user.name = e.target.value;
      }

      @Effect<UserStore>([])
      onMount() {
        onMountChangeCB();
      }

      @Effect<UserStore>(["user.name"])
      onUsernameChange() {
        onUsernameChangeCB();
      }

      @Effect<UserStore>(["user"], true)
      onUserChange() {
        onUserChangeCB();
      }

      @Effect<UserStore>("user.name")
      onUsernameAsStringDepChange() {
        onUsernameDepAsStringChangeCB();
      }
    }

    const App = connect(() => {
      const vm = useStore(UserStore);
      return (
        <>
          {vm.user.name}
          <input
            data-testid="username-input"
            value={vm.user.name}
            onChange={vm.changeUsername}
          />
        </>
      );
    }, UserStore);

    const { getByTestId } = render(<App />);

    expect(onMountChangeCB).toBeCalledTimes(1);
    expect(onUserChangeCB).toBeCalledTimes(1);
    expect(onUsernameChangeCB).toBeCalledTimes(1);
    expect(onUsernameDepAsStringChangeCB).toBeCalledTimes(1);

    fireEvent.change(getByTestId("username-input"), {
      target: { value: "amir.qasemi70" },
    });
    expect(onMountChangeCB).toBeCalledTimes(1);
    expect(onUserChangeCB).toBeCalledTimes(2);
    expect(onUsernameChangeCB).toBeCalledTimes(2);
    expect(onUsernameDepAsStringChangeCB).toBeCalledTimes(2);
  });

  describe("Parent Class", () => {
    it("should run parent store class effects", () => {
      const onMountedCB = jest.fn();

      @Store()
      class A {
        @Effect<A>([])
        onMount() {
          onMountedCB();
        }
      }

      @Store()
      class B extends A {}

      const App = connect(() => {
        return <></>;
      }, B);

      render(<App />);

      expect(onMountedCB).toBeCalledTimes(1);
    });

    it("should only run overridden effect method", () => {
      const baseStoreMountCB = jest.fn();
      const mainStoreMountCB = jest.fn();

      @Store()
      class BaseStore {
        @Effect([])
        onMount() {
          baseStoreMountCB();
        }
      }

      @Store()
      class MainStore extends BaseStore {
        @Effect([])
        onMount() {
          mainStoreMountCB();
        }
      }

      const App = connect(() => {
        return <></>;
      }, MainStore);

      render(<App />);

      expect(baseStoreMountCB).toBeCalledTimes(0);
      expect(mainStoreMountCB).toBeCalledTimes(1);
    });
  });
});
