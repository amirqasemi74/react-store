import React from "react";
import { ContextualStore, createStoreContext, useStore } from "react-over";
import { render } from "@testing-library/react";

describe("", () => {
  it("store hav value", () => {
    @ContextualStore()
    class UserStore {
      username = "amir.qasemi74";
      password = "123456";
    }
    const UserContext = createStoreContext(UserStore);

    const App = () => {
      const vm = useStore(UserStore);
      return (
        <UserContext>
          username: {vm.username}
          password: {vm.password}
        </UserContext>
      );
    };

    const { debug } = render(<App />);
  });
});
