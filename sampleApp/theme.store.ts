import { ToDoService } from "./toDos/services/todos.service";
import { Inject, Store } from "@react-store/core";

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
