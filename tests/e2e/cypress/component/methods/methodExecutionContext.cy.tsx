import { Effect, Store, connect, useStore } from "@react-store/core";

describe("Methods Execution Context", () => {
  it("should have correct value of store property if state is set and one render \
   after it has been occurred but react not updated the state value", function () {
    const logs: string[] = [];

    @Store()
    class UserStore {
      username = "a";

      @Effect([])
      onMount() {
        this.username = "aa";
        Promise.resolve().then(() => {
          logs.push(`promise.then: ${this.username}`);
          expect(this.username).to.be.eq("aa");
        });
      }

      @Effect([])
      cupHungryJob() {
        let i = 0;
        while (i < 1_000_000_0) {
          i++;
        }
      }
    }

    const User = connect(() => {
      const st = useStore(UserStore);
      logs.push(`render: ${st.username}`);
      return <>{st.username}</>;
    }, UserStore);

    cy.mount(<User />);

    cy.contains("aa").then(() => {
      /**
       * This pattern of logs occurred in react 18.2.
       * promise.then is called before second render.
       * why? still I don't know
       */
      expect(logs).to.deep.eq(["render: a", "promise.then: aa", "render: aa"]);
    });
  });
});
