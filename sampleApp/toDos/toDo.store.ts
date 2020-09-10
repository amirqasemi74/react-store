import { ContextStore, Effect, Inject } from "@react-store/core";
import { ChangeEvent, KeyboardEvent } from "react";
import ToDoService from "sampleApp/toDos/services/todos.service";
import ThemeStore from "../theme.store";
import FormValidator from "sampleApp/libs/formValidator";

@ContextStore()
@Inject(ToDoService, ThemeStore)
export default class ToDoStore {
  todos: ToDoItem[] = [{ value: "amir", isEditing: false }];

  todoCount = 0;

  todo = { value: "" };

  validator = new FormValidator(this.todo);

  constructor(public service: ToDoService, public theme: ThemeStore) {}

  @Effect()
  setTodoCount() {
    this.todoCount = this.todos.length;
    return () => console.log("clear Effect from effect 1 in ToDo Store");
  }

  onInputChange(e: ChangeEvent<HTMLInputElement>) {
    this.todo.value = e.target.value;
    this.validator.validate();
  }

  onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (
      e.key === "Enter" &&
      this.todo.value &&
      !this.todos.find(({ value }) => value === e.currentTarget.value)
    ) {
      this.todos.push({ value: this.todo.value, isEditing: false });
      this.todo.value = "";
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
