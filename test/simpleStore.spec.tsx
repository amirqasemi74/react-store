import { render } from "@testing-library/react";
import React from "react";
import { connectStore, ContextStore, useStore } from "react-store";

describe("", () => {
  it("store hav value", () => {
    @ContextStore()
    class UserStore {
      username = "amir.qasemi74";
      password = "123456";
    }

    const App = () => {
      const vm = useStore(UserStore);
      return (
        <div>
          username: {vm.username}
          password: {vm.password}
        </div>
      );
    };
    const AppWithStore = connectStore(App, UserStore);
    const { debug } = render(<AppWithStore />);
  });
});
