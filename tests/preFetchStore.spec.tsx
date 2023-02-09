import { PreFetch, ReactStore, Store, connect, useStore } from "@react-store/core";
import { render } from "@testing-library/react";
import React from "react";

describe.only("Store Prefetching", () => {
  it("should pre-fetch store", async () => {
    @Store()
    class UserStore {
      username = "";

      @PreFetch()
      async getUser() {
        this.username = "amir";
      }
    }

    await ReactStore.preFetch(UserStore, {});

    const App = connect(() => {
      const st = useStore(UserStore);

      return <>{st.username}</>;
    }, UserStore);

    const { getByText } = render(<App />);

    expect(getByText("amir")).toBeInTheDocument();
  });
});
