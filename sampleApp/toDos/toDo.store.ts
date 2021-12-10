import { Inject, Observable, Props, Store } from "@react-store/core";
import { ChangeEvent, KeyboardEvent } from "react";
import { FormValidator } from "sampleApp/libs/formValidator";
import { ToDoService } from "sampleApp/toDos/services/todos.service";
import ThemeStore from "../theme.store";

@Store()
export default class ToDoStore {
  @Props()
  props: any = {};

  todos: ToDoItem[] = [{ id: "123", value: "Job -1", isEditing: false }];

  todo = new ToDo();

  validator = new FormValidator(this.todo);

  d = new Date();

  constructor(
    @Inject(ThemeStore) public theme: ThemeStore,
    @Inject(ToDoService) public todoService: ToDoService
  ) {
    setTimeout(() => {
      this.init();
      console.log(this);
    });
  }

  init() {
    for (let i = 0; i < 10; i++) {
      this.todos.push({
        id: Math.random().toString(),
        value: "Job " + i.toString(),
        isEditing: false,
      });
    }
  }

  get todosCount() {
    return this.todos.length;
  }

  onInputChange(e: ChangeEvent<HTMLInputElement>) {
    this.todo.value = e.target.value;
  }

  onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (
      e.key === "Enter" &&
      this.todo.value &&
      !this.todos.find(({ value }) => value === e.currentTarget.value)
    ) {
      this.todos.push({
        id: Math.random().toString(),
        value: this.todo.value,
        isEditing: false,
      });
      this.todo.value = "";
    }
  }

  onToDoItemInputKeyDown(
    e: KeyboardEvent<HTMLInputElement>,
    itemIndex: number
  ) {
    if (e.key === "Enter") {
      this.todos[itemIndex].value = e.currentTarget.value;
      this.todos[itemIndex].isEditing = false;
    }
  }

  setToDoItemIsEditing(itemIndex: number) {
    this.todos[itemIndex].isEditing = true;
  }

  removeTodo(id: number) {
    this.todos = this.todos.filter((item, i) => i !== id);
  }
}

@Observable()
class ToDo {
  value = "";
}

interface ToDoItem {
  id: string;
  value: string;
  isEditing: boolean;
}
