import { ChangeEvent, KeyboardEvent } from "react";
import { ContextStore, Effect } from "react-store";
import ToDoService from "sampleApp/toDos/services/todos.service";
import ThemeStore from "../theme.store";

@ContextStore()
export default class ToDoStore {
  todos: ToDoItem[] = [];

  todoCount = 0;

  inputVal = "";

  constructor(public theme: ThemeStore, public service: ToDoService) {}

  @Effect()
  setTodoCount() {
    // this.todoCount = this.todos.length;
    return () => console.log("clear Effect from effect 1 in ToDo Store");
  }

  onInputChange(e: ChangeEvent<HTMLInputElement>) {
    this.inputVal = e.target.value;
  }

  onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (
      e.key === "Enter" &&
      this.inputVal &&
      !this.todos.find(({ value }) => value === e.currentTarget.value)
    ) {
      this.todos.push({ value: this.inputVal, isEditing: false });
      this.inputVal = "";
    }
  }

  onToDoItemInputKeyDown(
    e: KeyboardEvent<HTMLInputElement>,
    itemIndex: number
  ) {
    if (e.key === "Enter") {
      this.todos[itemIndex] = {
        value: e.currentTarget.value,
        isEditing: false,
      };
    }
  }

  setToDoItemIsEditing(itemIndex: number) {
    this.todos[itemIndex].isEditing = true;
  }

  removeTodo(id: number) {
    this.todos = this.todos.filter((item, i) => i !== id);
  }
}

interface ToDoItem {
  value: string;
  isEditing: boolean;
}
