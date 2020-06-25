import { ChangeEvent, KeyboardEvent } from "react";
import { ContextStore } from "react-over";
import { ThemeStore } from "../theme.store";

@ContextStore()
export class ToDoStore {
  todos: string[] = [];

  inputVal = "";

  constructor(public theme: ThemeStore) {}

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
    console.log(this);
  }

  editTodo(id: number, value: string) {
    this.todos[id] = value;
  }
}
