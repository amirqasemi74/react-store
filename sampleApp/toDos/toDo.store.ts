import { BaseStore } from "./base.store";
import { AutoEffect, Effect, Props, Store } from "@react-store/core";
import { ChangeEvent, KeyboardEvent } from "react";

@Store()
export class ToDoStore extends BaseStore {
  // @Props()
  props: any = {};

  todos: ToDoItem[] = [{ id: "123", value: "Job -1", isEditing: false }];

  @Effect([])
  init() {
    for (let i = 0; i < 100; i++) {
      this.todos.push({
        id: Math.random().toString(),
        value: "Job " + i.toString(),
        isEditing: false,
      });
    }
  }

  // get todosCount() {
  //   return this.todos.length;
  // }

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

  onToDoItemInputKeyDown(e: KeyboardEvent<HTMLInputElement>, itemIndex: number) {
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

interface ToDoItem {
  id: string;
  value: string;
  isEditing: boolean;
}
