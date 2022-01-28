import { Props, Store, connect, useStore } from "@react-store/core";
import { render } from "@testing-library/react";
import React from "react";

describe("Store Props", () => {
  it("should parent component have props directly", () => {
    let props!: any;
    @Store()
    class UserStore {}

    const App: React.FC<{ username: string }> = connect((_props) => {
      useStore(UserStore);
      props = _props;
      return <>store</>;
    }, UserStore);

    render(<App username="amir" />);
    expect(props.username).toBe("amir");
  });

  it("should connect props to store instance", () => {
    let userStoreFromUse!: UserStore;
    let userStoreFromThis!: UserStore;
    @Store()
    class UserStore {
      @Props()
      props: any;
      constructor() {
        userStoreFromThis = this;
      }
    }

    const App: React.FC<{ username: string }> = connect(() => {
      userStoreFromUse = useStore(UserStore);
      return <>store</>;
    }, UserStore);

    render(<App username="amir" />);

    expect(userStoreFromThis.props.username).toBe("amir");
    expect(userStoreFromUse.props.username).toBe("amir");
  });
});
