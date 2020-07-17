import { ChangeEvent, KeyboardEvent } from "react";
import { ContextStore, Effect } from "react-over";
import ThemeStore from "../theme.store";
import ToDoService from "sampleApp/services/todos.service";

@ContextStore()
export default class ToDoStore {
  todos: string[] = ["a", "b", "c"];

  inputVal = "a";

  constructor(public theme: ThemeStore, public service: ToDoService) {
    console.log(service);
  }

  @Effect()
  effect1() {
    console.log(this.theme.primary);
  }

  onInputChange(e: ChangeEvent<HTMLInputElement>) {
    this.inputVal = e.target.value;
  }

  onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (
      e.key === "Enter" &&
      this.inputVal &&
      !this.todos.includes(e.currentTarget.value)
    ) {
      this.todos.push(this.inputVal);
      this.inputVal = "";
    }
  }

  removeTodo(id: number) {
    this.todos = this.todos.filter((item, i) => i !== id);
  }

  editTodo(id: number, value: string) {
    this.todos[id] = value;
  }
}
