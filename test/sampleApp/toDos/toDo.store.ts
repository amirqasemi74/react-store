import { ContextualStore } from "react-over";
import { KeyboardEvent, ChangeEvent } from "react";

@ContextualStore()
export class ToDoStore {
  todos: string[] = [];

  inputVal = "";

  onInputChange(e: ChangeEvent<HTMLInputElement>) {
    this.inputVal = e.target.value;
  }
  onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && this.inputVal) {
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

console.log(ToDoStore.prototype);
