import { useUsername } from "./useUsername";
import { Effect, Hook, Store } from "@react-store/core";

@Store()
export class HooksStore {
  // @Hook(() => useParams().id)
  userId: string = "amir";

  // @Param("id")
  xId: string;

  @Hook((st: HooksStore) => useUsername(st.userId))
  username: string;

  @Effect("username")
  onMount() {
    // this.xId = this.username;
  }
}
