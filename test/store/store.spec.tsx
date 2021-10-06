import "@testing-library/jest-dom/extend-expect";
import { render, waitFor, screen } from "@testing-library/react";
import React, { useEffect } from "react";
import { connectStore, Effect, Store, useStore } from "@react-store/core";
import { act } from "react-dom/test-utils";

describe("Store", () => {
  it("should each component which use store, have same instance of it", () => {
    let usernameStore!: UserStore,
      passwordStore!: UserStore,
      appStore!: UserStore;

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
    const AppWithStore = connectStore(App, UserStore);
    const { getByText } = render(<AppWithStore />);
    // debug();

    expect(appStore).not.toBe(null);
    expect(passwordStore).not.toBe(null);
    expect(usernameStore).not.toBe(null);

    expect(appStore).toBe(passwordStore);
    expect(appStore).toBe(usernameStore);

    expect(getByText(/amir.qasemi74/i)).toBeInTheDocument();
    expect(getByText(/123456/i)).toBeInTheDocument();
    expect(getByText(/User store/i)).toBeInTheDocument();
  });

  it("should render on calling action in deeper pure react useEffect", async () => {
    @Store()
    class SampleStore {
      title = "title";

      changeTitle() {
        this.title = "changed title";
      }
    }

    const Title = () => {
      const st = useStore(SampleStore);

      useEffect(() => {
        st.changeTitle();
      }, []);
      return <>static content</>;
    };

    const App = connectStore(() => {
      const st = useStore(SampleStore);

      return (
        <>
          <span>{st.title}</span>
          <Title />
        </>
      );
    }, SampleStore);

    render(<App />);

    await waitFor(() =>
      expect(screen.getByText("changed title")).toHaveTextContent(
        "changed title"
      )
    );
  });

  describe("Actions", () => {
    it("should batch renders for multiple sync state mutations", async () => {
      let renderCount = 0;
      let setStateChanged;
      let doRender = new Promise((res) => {
        setStateChanged = res;
      });

      @Store()
      class SampleStore {
        title = "title";

        content = "content";

        constructor() {
          setTimeout(() => {
            act(() => {
              this.change();
              setStateChanged();
            });
          });
        }

        change() {
          this.title = "changed title";
          this.content = "changed content";
        }
      }

      const App = connectStore(() => {
        const st = useStore(SampleStore);
        renderCount++;
        return (
          <>
            <span>{st.title}</span>
            <span>{st.content}</span>
          </>
        );
      }, SampleStore);

      render(<App />);

      await doRender;
      expect(renderCount).toBe(2);
    });

    it.only("should actions cause render if state mutations is happened", async () => {
      let renderCount = 0;

      @Store()
      class SampleStore {
        title = "title";

        @Effect()
        onRender() {}
      }

      const App = connectStore(() => {
        const st = useStore(SampleStore);
        renderCount++;
        return (
          <>
            <span>{st.title}</span>
          </>
        );
      }, SampleStore);

      render(<App />);

      expect(renderCount).toBe(1);
    });
  });
});
