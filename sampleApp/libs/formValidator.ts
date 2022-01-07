import { Effect, StorePart } from "@react-store/core";
import ThemeStore from "sampleApp/theme.store";
import { UserService } from "sampleApp/toDos/services/userService";

@StorePart()
export class FormValidator {
  hasAnyError = false;

  form?: any;

  constructor(protected theme: ThemeStore, protected userService: UserService) {}

  @Effect("form", true)
  validate() {
    new Promise((res) => res(1)).then(() => {
      this.hasAnyError = !this.form?.value;
    });
  }
}
