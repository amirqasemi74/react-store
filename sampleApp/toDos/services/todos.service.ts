import { UserService } from "./userService";
import { Inject, Injectable, Injector } from "@react-store/core";

@Injectable()
export class ToDoService {
  private userService: UserService;

  constructor(private injector: Injector) {
    this.injector
      .getLazy(UserService)
      .then((userService) => (this.userService = userService));
  }

  toDos() {
    console.log("Gettig todos for user", this.userService.username);
  }
}
