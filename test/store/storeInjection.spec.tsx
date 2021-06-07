import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import React from "react";
import {
  connectStore,
  Store,
  Inject,
  useStore,
  StoreProvider,
} from "@react-store/core";

describe("Store Injection", () => {
  it("Upper store should inject into lower store", () => {
    let appStore!: AppStore, appStoreInUserStore!: AppStore;

    @Store()
    class AppStore {
      theme = "black";
    }

    @Store()
    @Inject(AppStore)
    class UserStore {
      username = "amir.qasemi74";
      password = "123456";

      constructor(public app: AppStore) {
        appStoreInUserStore = app;
      }
    }

    const User = () => {
      const vm = useStore(UserStore);
      return (
        <>
          {vm.username}
          {vm.password}
          {vm.app.theme}
        </>
      );
    };

    const App = () => {
      const vm = useStore(AppStore);
      appStore = vm;
      return (
        <StoreProvider type={UserStore}>
          <User />
        </StoreProvider>
      );
    };
    const AppWithStore = connectStore(App, AppStore);
    const { getByText } = render(<AppWithStore />);

    expect(appStore).not.toBe(null);
    expect(appStoreInUserStore).not.toBe(null);

    expect(appStore).toBe(appStoreInUserStore);

    expect(getByText(/amir.qasemi74/i)).toBeInTheDocument();
    expect(getByText(/123456/i)).toBeInTheDocument();
    expect(getByText(/black/i)).toBeInTheDocument();
  });
});
