import { Store, connect, useStore } from "@react-store/core";
import { act, render } from "@testing-library/react";
import React from "react";
import { StoreAdministrator } from "src/react/store/administrator/storeAdministrator";

export const storeComputedTests = () => {
  it("should compute getter if dependencies has been changed", () => {
    const passLenFn = jest.fn();
    const usernameFn = jest.fn();
    let storeRef!: SampleStore;

    @Store()
    class SampleStore {
      private password = "123456";

      private user = { username: "amir" };

      get passLen() {
        passLenFn();
        return this.password.length;
      }

      get username() {
        usernameFn();
        return this.user.username;
      }

      changeUser() {
        this.user.username = "reza";
      }

      changePassword() {
        this.password = "1234";
      }
    }

    const App = connect(() => {
      const st = useStore(SampleStore);
      storeRef = st;
      return (
        <>
          <span>{st.passLen}</span>
          <span>{st.username}</span>
        </>
      );
    }, SampleStore);

    const { getByText } = render(<App />);

    const storeAdmin = StoreAdministrator.get(storeRef);

    expect(getByText("6")).toBeInTheDocument();
    expect(getByText("amir")).toBeInTheDocument();
    expect(passLenFn).toBeCalledTimes(1);
    expect(usernameFn).toBeCalledTimes(1);
    expect(storeAdmin.gettersManager.getters.get("username"));
    act(() => {
      storeRef.changePassword();
      storeRef.changeUser();
    });

    expect(getByText("4")).toBeInTheDocument();
    expect(getByText("reza")).toBeInTheDocument();
    expect(passLenFn).toBeCalledTimes(2);
    expect(usernameFn).toBeCalledTimes(2);

    expect(storeAdmin.gettersManager.getters.get("username")?.deps).toStrictEqual([
      ["user", "username"],
    ]);
    expect(storeAdmin.gettersManager.getters.get("passLen")?.deps).toStrictEqual([
      ["password"],
    ]);
  });

  it("should calculate getter dependencies correctly", () => {
    const PRIVATE_PROP = Symbol("PRIVATE_PROP");
    let storeRef!: SampleStore;

    @Store()
    class SampleStore {
      private password = "123456";

      private objA: any = { b: [1, 2, { c: [{ d: [7] }] }], [PRIVATE_PROP]: 10 };

      private arrB: any = [
        { v: 1 },
        { v: 2 },
        { v: 3 },
        { v: 4 },
        { v: 5 },
        { v: 6 },
        { v: 7 },
      ];

      get getObjA() {
        return this.objA.b[2].c[0].d[0];
      }

      get getObjAPrivate() {
        return this.objA[PRIVATE_PROP];
      }

      get getArrB() {
        return this.arrB.filter((e) => e.v > 3).length;
      }
    }

    const App = connect(() => {
      const st = useStore(SampleStore);
      storeRef = st;
      return (
        <>
          <span>{st.getObjA}</span>
          <span>{st.getArrB}</span>
          <span>{st.getObjAPrivate}</span>
        </>
      );
    }, SampleStore);

    const { getByText } = render(<App />);

    const storeAdmin = StoreAdministrator.get(storeRef);

    expect(getByText("7")).toBeInTheDocument();

    expect(storeAdmin.gettersManager.getters.get("getObjA")?.deps).toHaveLength(1);
    expect(storeAdmin.gettersManager.getters.get("getObjA")?.deps[0].join(".")).toBe(
      "objA.b.2.c.0.d.0"
    );

    expect(
      storeAdmin.gettersManager.getters.get("getObjAPrivate")?.deps
    ).toHaveLength(1);
    expect(
      storeAdmin.gettersManager.getters.get("getObjAPrivate")?.deps[0]
    ).toStrictEqual(["objA", PRIVATE_PROP]);

    expect(storeAdmin.gettersManager.getters.get("getArrB")?.deps).toHaveLength(1);
    expect(storeAdmin.gettersManager.getters.get("getArrB")?.deps[0].join(".")).toBe(
      "arrB"
    );
  });
};
