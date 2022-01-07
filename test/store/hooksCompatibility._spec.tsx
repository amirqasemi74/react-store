import { Store, connect, useStore } from "@react-store/core";
import { render, screen, waitFor } from "@testing-library/react";
import React, { useEffect } from "react";

export const storeHooksCompatibilityTests = () => {
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

    const App = connect(() => {
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
      expect(screen.getByText("changed title")).toHaveTextContent("changed title")
    );
  });
};
