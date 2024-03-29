import { Effect, Hook, Store, connect, useStore } from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { act, render, waitFor } from "@testing-library/react";
import React, { useEffect, useState } from "react";
import { UnobservableProperty } from "src/store/administrator/propertyKeys/unobservableProperty";
import { StoreAdministrator } from "src/store/administrator/storeAdministrator";

describe("Hook Decorator", () => {
  it("should can use pure react hook in store", async () => {
    const useUrl = () => {
      const [url, setUrl] = useState("");
      useEffect(() => {
        setUrl("google.com");
      }, []);
      return url;
    };

    @Store()
    class HooksStore {
      @Hook(useUrl)
      url: string;
    }

    const App = connect(() => {
      const st = useStore(HooksStore);

      return <p>{st.url}</p>;
    }, HooksStore);

    const { getByText } = render(<App />);

    await waitFor(() => expect(getByText("google.com")).toBeInTheDocument());
  });

  it("should run effect on pure react hook run", async () => {
    const useUrl = () => {
      const [url, setUrl] = useState("");
      useEffect(() => {
        setUrl("google.com");
      }, []);
      return url;
    };

    @Store()
    class HooksStore {
      @Hook(useUrl)
      url: string;

      address: string;

      @Effect("url")
      onUrlChanged() {
        this.address = `https://${this.url}`;
      }
    }

    const App = connect(() => {
      const st = useStore(HooksStore);
      return <p>{st.address}</p>;
    }, HooksStore);

    const { getByText } = render(<App />);

    await waitFor(() => expect(getByText("https://google.com")).toBeInTheDocument());
  });

  it("should Hook property key be readonly", async () => {
    const errorMock = jest.spyOn(console, "error").mockImplementation();
    let store!: HooksStore;
    const useUrl = () => {
      const [url] = useState("url");
      return url;
    };

    @Store()
    class HooksStore {
      @Hook(useUrl)
      url: string;

      constructor() {
        store = this;
      }
    }

    const App = connect(() => {
      const st = useStore(HooksStore);
      return <>{st.url}</>;
    }, HooksStore);

    render(<App />);

    act(() => {
      store.url = "sdf";
    });
    expect(errorMock).toBeCalledWith(
      "`HooksStore.url` is decorated with `@Hook(...)`, so can't be mutated."
    );

    const pkInfo = StoreAdministrator.get(
      store
    )!.propertyKeysManager.propertyKeys.get("url") as UnobservableProperty;

    expect(pkInfo).toBeInstanceOf(UnobservableProperty);
    expect(pkInfo.isReadonly).toBeTruthy();

    expect(store.url).toBe("url");
  });
});
