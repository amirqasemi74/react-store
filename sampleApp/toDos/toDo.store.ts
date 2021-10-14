import { Store, Effect, Inject, Props, Action } from "@react-store/core";
import { ChangeEvent, KeyboardEvent } from "react";
import { ToDoService } from "sampleApp/toDos/services/todos.service";
import ThemeStore from "../theme.store";
import FormValidator from "sampleApp/libs/formValidator";

@Store()
export default class ToDoStore {
  @Props()
  props: any = {};

  todos: ToDoItem[] = [{ id: "123", value: "Job -1", isEditing: false }];

  todo = { value: "" };

  validator = new FormValidator(this.todo);

  constructor(
    @Inject(ThemeStore) public theme: ThemeStore,
    @Inject(ToDoService) public todoService: ToDoService
  ) {
    setTimeout(() => {
      this.init();
    });
  }

  // @Action()
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
  // @Effect((_: ToDoStore) => [_.todos.length])
  // setTodoCount() {
  //   this.todoCount = this.todos.length;
  // }

  onInputChange(e: ChangeEvent<HTMLInputElement>) {
    this.todo.value = e.target.value;
    this.todoService.toDos();
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

interface ToDoItem {
  id: string;
  value: string;
  isEditing: boolean;
}
