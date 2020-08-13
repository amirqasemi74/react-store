import { ContextStore, Effect } from "react-over";

@ContextStore()
export default class ThemeStore {
  primary = "black";

  secondary = "gray";

  changePrimary() {
    this.primary = "green";
  }

  @Effect()
  logPrimary() {
    console.log(this.primary);
    // return 2;
  }
}
