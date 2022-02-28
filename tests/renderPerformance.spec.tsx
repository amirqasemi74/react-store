import {
  AutoWire,
  Effect,
  Hook,
  Store,
  StorePart,
  connect,
  useStore,
} from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import React, { Profiler, useEffect, useState } from "react";

describe("Render Performance", () => {
  it("should react have 2 commit phase", async () => {
    const renderCommits = new Set<number>();

    const onRender: React.ProfilerOnRenderCallback = (...[, , , , , commitTime]) => {
      renderCommits.add(commitTime);
    };

    @Store()
    class UserStore {
      username = "amir";

      password = "123";

      @Effect([])
      m() {
        setTimeout(() => {
          this.changeUsername();
        });
      }

      changeUsername() {
        this.username = "reza";
      }
    }

    const ShowPassword = React.memo(() => {
      const st = useStore(UserStore);
      return (
        <Profiler id="password" onRender={onRender}>
          <span>{st.password}</span>
        </Profiler>
      );
    });

    const Main = () => {
      const st = useStore(UserStore);
      return (
        <>
          <span>{st.username}</span>
          <ShowPassword />
        </>
      );
    };

    const App = connect(
      () => (
        <Profiler id="App" onRender={onRender}>
          <Main />
        </Profiler>
      ),
      UserStore
    );

    const { findByText } = render(
      <Profiler id="main" onRender={onRender}>
        <App />
      </Profiler>
    );
    expect(renderCommits.size).toBe(1);
    await waitFor(async () => expect(await findByText("amir")).toBeInTheDocument());

    await waitFor(async () => expect(await findByText("reza")).toBeInTheDocument());
    expect(renderCommits.size).toBe(2);
  });

  it("should react have 2 commit phase along with having store part", async () => {
    const renderCommits = new Set<number>();

    const onRender: React.ProfilerOnRenderCallback = (...[, , , , , commitTime]) => {
      renderCommits.add(commitTime);
    };

    @StorePart()
    class Part {
      id = "id";

      @Effect([])
      n() {
        this.id = "ID";
      }
    }

    @Store()
    class UserStore {
      username = "amir";

      password = "123";

      @AutoWire()
      p!: Part;

      @Effect([])
      m() {
        this.changeUsername();
      }

      changeUsername() {
        this.username = "reza";
      }
    }

    const ShowPassword = React.memo(() => {
      const st = useStore(UserStore);
      return (
        <Profiler id="password" onRender={onRender}>
          <span>{st.password}</span>
        </Profiler>
      );
    });

    const _App = () => {
      const st = useStore(UserStore);
      return (
        <>
          <span>{st.username}</span>
          <p>{st.p.id}</p>
          <ShowPassword />
        </>
      );
    };

    const App = connect(
      () => (
        <Profiler id="App" onRender={onRender}>
          <_App />
        </Profiler>
      ),
      UserStore
    );

    const { findByText } = render(
      <Profiler id="main" onRender={onRender}>
        <App />
      </Profiler>
    );
    await waitFor(async () => expect(await findByText("reza")).toBeInTheDocument());
    await waitFor(async () => expect(await findByText("ID")).toBeInTheDocument());
    expect(renderCommits.size).toBe(2);
  });

  it("should react have 2 commit phase with using @Hook decorator", async () => {
    const renderCommits = new Set<number>();

    const onRender: React.ProfilerOnRenderCallback = (...[, , , , , commitTime]) => {
      renderCommits.add(commitTime);
    };

    function useUsername(userId: string) {
      const [username, setUsername] = useState("");

      useEffect(() => {
        setUsername(userId);
      }, [userId]);

      return username;
    }

    @Store()
    class UserStore {
      @Hook(() => useUsername("amir"))
      username: string;
    }

    const Main = () => {
      const st = useStore(UserStore);
      return (
        <>
          <span>{st.username}</span>
        </>
      );
    };

    const App = connect(
      () => (
        <Profiler id="App" onRender={onRender}>
          <Main />
        </Profiler>
      ),
      UserStore
    );

    const { getByText } = render(
      <Profiler id="main" onRender={onRender}>
        <App />
      </Profiler>
    );
    expect(renderCommits.size).toBe(2);
    expect(getByText("amir")).toBeInTheDocument();
  });
});
