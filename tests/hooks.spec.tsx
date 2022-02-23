import { AutoEffect, Hook, Store, connect, useStore } from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { render, waitFor } from "@testing-library/react";
import React, { useEffect, useState } from "react";

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

      @AutoEffect()
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
});
