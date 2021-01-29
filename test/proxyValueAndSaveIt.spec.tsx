import { connectStore, Store, useStore } from "@react-store/core";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import React from "react";

describe("Proxy value and save it", () => {
  it("should save proxy value for arrays & object & function", () => {
    let storeRef: SampleStore | null = null;

    @Store()
    class SampleStore {
      array = [1, { a: 1 }];
      object = { a: [], b: 1 };
      onChange() {}
    }

    const TestStore: React.FC = connectStore(() => {
      const vm = useStore(SampleStore);
      storeRef = vm;
      return <div>App</div>;
    }, SampleStore);

    render(<TestStore />);

    expect(storeRef!.array).toBeDefined();
    expect(storeRef!.array).toBe(storeRef!.array);
    expect(storeRef!.object).toBeDefined();
    expect(storeRef!.object).toBe(storeRef!.object);
    expect(storeRef!.onChange).toBeDefined();
    expect(storeRef!.onChange).toBe(storeRef!.onChange);
  });

  it("should saved proxied value be per instance of store", () => {
    let storeRef: SampleStore | null = null;
    @Store()
    class SampleStore {
      array = [1, { a: 1 }];
      object = { a: [], b: 1 };
      onChange() {}
    }

    const TestStore: React.FC = connectStore(() => {
      const vm = useStore(SampleStore);
      storeRef = vm;
      return <div>App</div>;
    }, SampleStore);

    const { unmount } = render(<TestStore />);

    const preArray = storeRef!.array;
    const preObject = storeRef!.object;
    const preOnChange = storeRef!.onChange;

    unmount();
    render(<TestStore />);

    expect(storeRef!.array).not.toBe(preArray);
    expect(storeRef!.object).not.toBe(preObject);
    expect(storeRef!.onChange).not.toBe(preOnChange);
  });
});
