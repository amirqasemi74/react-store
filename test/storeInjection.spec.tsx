import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import React from "react";
import { connectStore, ContextStore, useStore } from "react-over";

describe("Store Injection", () => {
  it("Upper store should inject into lower store", () => {
    let appStoreRef: AppStore | null = null,
      appStoreRefInUserStore: AppStore | null = null;

    @ContextStore()
    class AppStore {
      theme = "black";
    }

    @ContextStore()
    class UserStore {
      username = "amir.qasemi74";
      password = "123456";

      constructor(public app: AppStore) {
        appStoreRefInUserStore = app;
      }
    }

    const User = connectStore(() => {
      const vm = useStore(UserStore);
      return (
        <>
          {vm.username}
          {vm.password}
          {vm.app.theme}
        </>
      );
    }, UserStore);

    const App = () => {
      const vm = useStore(AppStore);
      appStoreRef = vm;
      return (
        <>
          <User />
        </>
      );
    };
    const AppWithStore = connectStore(App, AppStore);
    const { getByText } = render(<AppWithStore />);

    expect(appStoreRef).not.toBe(null);
    expect(appStoreRefInUserStore).not.toBe(null);

    expect(appStoreRef).toBe(appStoreRefInUserStore);

    expect(getByText(/amir.qasemi74/i)).toBeInTheDocument();
    expect(getByText(/123456/i)).toBeInTheDocument();
    expect(getByText(/black/i)).toBeInTheDocument();
  });
});
