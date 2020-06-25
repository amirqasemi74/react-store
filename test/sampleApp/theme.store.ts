import { ContextStore } from "react-over";

@ContextStore()
export class ThemeStore {
  primary = "black";

  secondary = "gray";

  changePrimary() {
    this.primary = "green";
  }
}
