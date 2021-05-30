import { Store, Effect, Inject, Props } from "@react-store/core";
import { ChangeEvent, KeyboardEvent } from "react";
import { ToDoService } from "sampleApp/toDos/services/todos.service";
import ThemeStore from "../theme.store";
import FormValidator from "sampleApp/libs/formValidator";

@Store()
export default class ToDoStore {
  @Props
  props: any;

  todos: ToDoItem[] = [{ value: "amir", isEditing: false }];

  todoCount = 0;

  todo = { value: "" };

  validator = new FormValidator(this.todo);

  constructor(
    @Inject(ThemeStore) public theme: ThemeStore,
    @Inject(ToDoService) public todoService: ToDoService
  ) {
    // this.init();
  }

  init() {
    setTimeout(() => {
      for (let i = 0; i < 150; i++) {
        this.todos.push({ value: i.toString(), isEditing: false });
      }
    });
  }

  @Effect((_: ToDoStore) => [_.todos.length])
  setTodoCount() {
    this.todoCount = this.todos.length;
  }

  onInputChange(e: ChangeEvent<HTMLInputElement>) {
    this.todo.value = e.target.value;
    this.validator.validate();
    this.todoService.toDos();
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
  value: string;
  isEditing: boolean;
}
