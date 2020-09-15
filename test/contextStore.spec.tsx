import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import React from "react";
import { connectStore, ContextStore, useStore } from "@react-store/core";

describe("Contextual store", () => {
  it("each component which use contextual store should have same instacnce of it", () => {
    @ContextStore()
    class UserStore {
      title = "User store";
      username = "amir.qasemi74";
      password = "123456";
    }

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
        <>
          <p>{vm.title}</p>
          <Password />
          <Username />
        </>
      );
    };
    const AppWithStore = connectStore(App, UserStore);
    const { getByText } = render(<AppWithStore />);
    // debug();

    expect(appStoreRef).not.toBe(null);
    expect(passwordStoreRef).not.toBe(null);
    expect(usernameStoreRef).not.toBe(null);

    expect(appStoreRef).toBe(passwordStoreRef);
    expect(appStoreRef).toBe(usernameStoreRef);

    expect(getByText(/amir.qasemi74/i)).toBeInTheDocument();
    expect(getByText(/123456/i)).toBeInTheDocument();
    expect(getByText(/User store/i)).toBeInTheDocument();
  });
});
