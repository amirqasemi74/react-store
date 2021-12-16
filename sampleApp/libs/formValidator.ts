import { Effect, StorePart } from "@react-store/core";

@StorePart()
export class FormValidator {
  hasAnyError = false;

  constructor(private form: any) {}

  @Effect((_) => [_.form], true)
  validate() {
    new Promise((res) => res(1)).then(() => {
      this.hasAnyError = !this.form.value;
    });
  }
}
