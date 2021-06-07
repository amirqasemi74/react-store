import { Inject, Injectable, Injector } from "@react-store/core";
import { ToDoService } from "./todos.service";

@Injectable()
export class UserService {
  username = `user-${Math.floor(Math.random() * 100)}`;
  
  private toDoService: ToDoService;

  constructor(@Inject(Injector) private injector: Injector) {
    this.injector
      .getLazy(ToDoService)
      .then((todoService) => (this.toDoService = todoService));
  }
}
