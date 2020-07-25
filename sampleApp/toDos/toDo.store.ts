import { ChangeEvent, KeyboardEvent } from "react";
import { ContextStore, Effect, dep } from "react-over";
import ThemeStore from "../theme.store";
import ToDoService from "sampleApp/services/todos.service";

@ContextStore()
export default class ToDoStore {
  todos: string[] = ["a", "b", "c"];

  todoCount = 0;

  inputVal = "d";

  constructor(public theme: ThemeStore, public service: ToDoService) {}

  @Effect()
  effect1() {
    this.todoCount = this.todos.length;
    return () => console.log("clear Effect from effect 1 in ToDo Store");
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
