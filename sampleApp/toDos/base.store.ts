import ThemeStore from "../theme.store";
import { AutoWire, Effect, Observable, Store, Wire } from "@react-store/core";
import { FormValidator } from "sampleApp/libs/formValidator";
import { ToDoService } from "sampleApp/toDos/services/todos.service";

@Store()
export class BaseStore {
  todo = new ToDo();

  // @AutoWire()
  readonly validator: FormValidator;

  constructor(public theme: ThemeStore, public todoService: ToDoService) {}

  // @Effect([])
  onMount() {
    this.validator.form = this.todo;
  }
}

@Observable()
class ToDo {
  value = "";
}
