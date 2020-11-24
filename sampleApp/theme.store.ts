import { Store, Effect } from "@react-store/core";

@Store()
export default class ThemeStore {
  primary = "black";

  secondary = "gray";

  changePrimary() {
    this.primary = "green";
  }

  // @Effect()
  logPrimary() {
    // console.log(this.primary);
    // return 2;
  }
}
