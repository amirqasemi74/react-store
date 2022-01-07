import { Effect, Store, connect, useStore } from "@react-store/core";
import { act, render } from "@testing-library/react";
import React from "react";

export const storeActionsTest = () => {
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

    const App = connect(() => {
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

  it("should actions cause render if state mutations is happened", async () => {
    let renderCount = 0;

    @Store()
    class SampleStore {
      title = "title";

      @Effect()
      onRender() {}
    }

    const App = connect(() => {
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
};
