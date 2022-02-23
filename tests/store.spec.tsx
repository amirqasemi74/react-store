import { Store, connect, useStore } from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import React from "react";
import { clearContainer } from "src/container/container";

describe("Store", () => {
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
