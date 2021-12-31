import ThemeStore from "../theme.store";
import { Effect, Store } from "@react-store/core";
import { ToDoService } from "sampleApp/toDos/services/todos.service";

@Store()
export class BaseStore {
  constructor(public theme: ThemeStore, public todoService: ToDoService) {}

  @Effect<BaseStore>([])
  onMount() {
    console.log("mounted");
  }
}
