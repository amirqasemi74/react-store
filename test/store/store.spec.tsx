import { storeActionsTest } from "./actions._spec";
import { storeEffectTests } from "./effects._spec";
import { storeHooksCompatibilityTests } from "./hooksCompatibility._spec";
import { storeInjectionTests } from "./injection._spec";
import { storePropertiesObservability } from "./propertiesObservability._spec";
import { storePartTests } from "./storePart._spec";
import { Store, connect, useStore } from "@react-store/core";
import { render } from "@testing-library/react";
import React from "react";
import { clearContainer } from "src/container/container";

describe("Store", () => {
  beforeEach(() => {
    clearContainer();
    jest.restoreAllMocks();
  });

  describe("Effects", storeEffectTests);
  describe("Actions", storeActionsTest);
  describe("Injections", storeInjectionTests);
  describe("StoreParts", storePartTests);
  describe("Properties Observability", storePropertiesObservability);
  describe("Pure React Hook Compatibility", storeHooksCompatibilityTests);

  it("should each component which use store, have same instance of it", () => {
    let usernameStore!: UserStore, passwordStore!: UserStore, appStore!: UserStore;

    @Store()
    class UserStore {
      title = "User store";
      username = "amir.qasemi74";
      password = "123456";
    }

    const Username = () => {
      const vm = useStore(UserStore);
      usernameStore = vm;
      return <p>username: {vm.username}</p>;
    };
    const Password = () => {
      const vm = useStore(UserStore);
      passwordStore = vm;
      return <p>password: {vm.password}</p>;
    };

    const App = () => {
      const vm = useStore(UserStore);
      appStore = vm;
      return (
        <>
          <p>{vm.title}</p>
          <Password />
          <Username />
        </>
      );
    };
    const AppWithStore = connect(App, UserStore);
    const { getByText } = render(<AppWithStore />);

    expect(appStore).not.toBe(null);
    expect(passwordStore).not.toBe(null);
    expect(usernameStore).not.toBe(null);

    expect(appStore).toBe(passwordStore);
    expect(appStore).toBe(usernameStore);

    expect(getByText(/amir.qasemi74/i)).toBeInTheDocument();
    expect(getByText(/123456/i)).toBeInTheDocument();
    expect(getByText(/User store/i)).toBeInTheDocument();
  });
});
