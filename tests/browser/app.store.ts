import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { Effect, Store } from "@react-store/core";

const me = () => {
  new ApolloClient({
    uri: "https://graphqlzero.almansi.me/api",
    cache: new InMemoryCache(),
  }).query({
    query: gql`
      {
        users {
          data {
            name
          }
        }
      }
    `,
  });
};
@Store()
export class AppStore {
  username = "a";

  @Effect([])
  mount() {
    this.username = "aa";
    Promise.resolve().then(() => {
      console.log("====>", this.username);
    });
  }

  @Effect([])
  me() {
    let i = 0;
    while (i < 1_000_000_000) {
      i++;
    }
    // me();
  }
}
