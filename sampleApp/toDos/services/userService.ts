import { ToDoService } from "./todos.service";
import { Inject, Injectable, Injector } from "@react-store/core";

@Injectable()
export class UserService {
  username = `user-${Math.floor(Math.random() * 100)}`;

  private toDoService: ToDoService;

  constructor(private injector: Injector) {
    this.injector
      .getLazy(ToDoService)
      .then((todoService) => (this.toDoService = todoService));
  }
}
