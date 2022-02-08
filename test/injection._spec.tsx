import {
  Injectable,
  Store,
  StoreProvider,
  connect,
  useStore,
} from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render } from "@testing-library/react";
import React, { memo } from "react";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";

export const storeInjectionTests = () => {
  it("should inject @Injectable into store", () => {
    expect.assertions(5);

    @Injectable()
    class UserService {}

    @Injectable()
    class PostService {}

    @Store()
    class PostStore {
      constructor(postService: PostService, userService: UserService) {
        expect(postService).toBeInstanceOf(PostService);
        expect(userService).toBeInstanceOf(UserService);
        userService = userService;
      }
    }

    @Store()
    class UserStore {
      username = "amir.qasemi74";
      password = "123456";

      constructor(postStore: PostStore, userService: UserService) {
        expect(postStore).toBeInstanceOf(PostStore);
        expect(userService).toBeInstanceOf(UserService);
        expect(userService).toBe(userService);
      }
    }

    const App = () => {
      const vm = useStore(UserStore);
      useStore(PostStore);
      return (
        <div>
          username: {vm.username}
          password: {vm.password}
        </div>
      );
    };
    const AppWithStore = connect(connect(App, UserStore), PostStore);
    render(<AppWithStore />);
  });

  it("should upper store inject into lower store", () => {
    let appStore!: AppStore, appStoreInUserStore!: AppStore;

    @Store()
    class AppStore {
      theme = "black";
    }

    @Store()
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
    const AppWithStore = connect(App, AppStore);
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
    @Store()
    class AppStore {
      theme = "black";

      changeTheme() {
        this.theme = "white";
      }
    }

    @Store()
    class UserStore {
      username = "amir.qasemi74";
      password = "123456";

      constructor(public app: AppStore) {}
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
      return (
        <>
          <button onClick={vm.changeTheme}>change Theme</button>
          <StoreProvider type={UserStore} render={User} />
        </>
      );
    };
    const AppWithStore = connect(App, AppStore);
    const { getByText } = render(<AppWithStore />);

    fireEvent.click(getByText("change Theme"));

    expect(getByText(/white/i)).toBeInTheDocument();
  });

  describe("Inheritance", () => {
    it("should inject parent store dependencies", () => {
      let mainStore!: MainStore;
      @Injectable()
      class A {}

      @Store()
      class BaseStore {
        constructor(public a: A) {}
      }

      @Store()
      class MainStore extends BaseStore {}

      const App = connect(() => {
        mainStore = useStore(MainStore);
        return <></>;
      }, MainStore);

      render(<App />);

      expect(mainStore.a).toBeInstanceOf(A);
    });

    it("should inject main store dependencies and ignore parent dependencies", () => {
      let mainStore!: MainStore;
      @Injectable()
      class A {}

      @Injectable()
      class B {}

      @Store()
      class BaseStore {
        constructor(public a: A) {}
      }

      @Store()
      class MainStore extends BaseStore {
        constructor(public a: A, public b: B) {
          super(a);
        }
      }

      const App = connect(() => {
        mainStore = useStore(MainStore);
        return <></>;
      }, MainStore);

      render(<App />);

      expect(mainStore.a).toBeInstanceOf(A);
      expect(mainStore.b).toBeInstanceOf(B);
    });
  });
};
