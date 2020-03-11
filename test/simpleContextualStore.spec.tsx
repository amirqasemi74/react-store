import { Injectable, useStore, createStoreContext } from "react-over";
import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

describe("Contextual store", () => {
  it("each component which use contextual store should have same instacnce of it", () => {
    @Injectable
    class UserStore {
      title = "User store";
      username = "amir.qasemi74";
      password = "123456";
    }
    const UserContext = createStoreContext(UserStore);

    let usernameStoreRef: UserStore | null = null,
      passwordStoreRef: UserStore | null = null,
      appStoreRef: UserStore | null = null;

    const Username = () => {
      const vm = useStore(UserStore);
      usernameStoreRef = vm;
      return <p>username: {vm.username}</p>;
    };
    const Password = () => {
      const vm = useStore(UserStore);
      passwordStoreRef = vm;
      return <p>password: {vm.password}</p>;
    };
    const App = () => {
      const vm = useStore(UserStore);
      appStoreRef = vm;
      return (
        <UserContext>
          <p>{vm.title}</p>
          <Password />
          <Username />
        </UserContext>
      );
    };

    const { getByText } = render(<App />);
    // debug();

    expect(appStoreRef).not.toBe(null);
    expect(passwordStoreRef).not.toBe(null);
    expect(usernameStoreRef).not.toBe(null);

    expect(appStoreRef).toBe(usernameStoreRef);
    expect(appStoreRef).toBe(passwordStoreRef);

    expect(getByText(/amir.qasemi74/i)).toBeInTheDocument();
    expect(getByText(/123456/i)).toBeInTheDocument();
    expect(getByText(/User store/i)).toBeInTheDocument();
  });
});
