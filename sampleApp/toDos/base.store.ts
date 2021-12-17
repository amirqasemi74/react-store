import { Inject, Store } from "@react-store/core";
import { ToDoService } from "sampleApp/toDos/services/todos.service";
import ThemeStore from "../theme.store";

@Store()
export class BaseStore {
  constructor(
    @Inject(ThemeStore) public theme: ThemeStore,
    @Inject(ToDoService) public todoService: ToDoService
  ) {}
}
