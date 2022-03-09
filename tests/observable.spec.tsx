import { Observable, Store, connect, useStore } from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";

describe("Observable Decorator", () => {
  it("should render on observable class change", () => {
    let store!: ObservableTestStore;

    @Observable()
    class Obs2 {
      y = "obs2";
    }

    @Observable()
    class Obs1 {
      x = "obs1";

      obs2 = new Obs2();
    }

    @Store()
    class ObservableTestStore {
      obs = new Obs1();

      constructor() {
        store = this;
      }
    }

    const App = connect(() => {
      const st = useStore(ObservableTestStore);
      return (
        <>
          <p>{st.obs.x}</p>
          <p>{st.obs.obs2.y}</p>
        </>
      );
    }, ObservableTestStore);

    const { getByText } = render(<App />);

    expect(getByText("obs1")).toBeInTheDocument();
    expect(getByText("obs2")).toBeInTheDocument();

    act(() => {
      store.obs.x = "obs1.1";
    });
    expect(getByText("obs1.1")).toBeInTheDocument();

    act(() => {
      store.obs.obs2.y = "obs2.1";
    });
    expect(getByText("obs2.1")).toBeInTheDocument();
  });
});
