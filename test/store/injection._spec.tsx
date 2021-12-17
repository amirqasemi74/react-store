import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import React, { memo } from "react";
import {
  connectStore,
  Store,
  Inject,
  useStore,
  StoreProvider,
} from "@react-store/core";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";

export const storeInjectionTests = () => {
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
      return <StoreProvider type={UserStore} render={User} />;
    };
    const AppWithStore = connectStore(App, AppStore);
    const { getByText } = render(<AppWithStore />);

    expect(appStore).not.toBe(null);
    expect(appStoreInUserStore).not.toBe(null);

    expect(StoreAdministrator.get(appStore)).toBe(
      StoreAdministrator.get(appStoreInUserStore)
    );

    expect(getByText(/amir.qasemi74/i)).toBeInTheDocument();
    expect(getByText(/123456/i)).toBeInTheDocument();
    expect(getByText(/black/i)).toBeInTheDocument();
  });

  it("Upper store mutations should rerender it's consumers", () => {
    let appStore!: AppStore, appStoreInUserStore!: AppStore;

    @Store()
    class AppStore {
      theme = "black";

      changeTheme() {
        this.theme = "white";
      }
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

    const User = memo(() => {
      const vm = useStore(UserStore);
      return (
        <>
          {vm.username}
          {vm.password}
          {vm.app.theme}
        </>
      );
    });

    const App = () => {
      const vm = useStore(AppStore);
      appStore = vm;
      return (
        <>
          <button onClick={vm.changeTheme}>change Theme</button>
          <StoreProvider type={UserStore} render={User} />
        </>
      );
    };
    const AppWithStore = connectStore(App, AppStore);
    const { getByText } = render(<AppWithStore />);

    fireEvent.click(getByText("change Theme"));

    expect(getByText(/white/i)).toBeInTheDocument();
  });
};
