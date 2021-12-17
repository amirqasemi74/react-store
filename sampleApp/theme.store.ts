import { Inject, Store } from "@react-store/core";
import { ToDoService } from "./toDos/services/todos.service";

@Store()
@Inject(ToDoService)
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
