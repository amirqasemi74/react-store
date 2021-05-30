import { Inject, Injectable, Injector } from "@react-store/core";
import { UserService } from "./userService";

@Injectable()
export class ToDoService {
  private userService: UserService;

  constructor(@Inject(Injector) private injector: Injector) {
    this.injector
      .getLazy(UserService)
      .then((userService) => (this.userService = userService));
  }

  toDos() {
    console.log("Gettig todos for user", this.userService.username);
  }
}
