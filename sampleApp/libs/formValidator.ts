import { Effect, StorePart } from "@react-store/core";

@StorePart()
export class FormValidator {
  hasAnyError = false;

  constructor(private form: any) {}

  @Effect({ deps: (_) => [_.form], dequal: true })
  validate() {
    new Promise((res) => res(1)).then(() => {
      this.hasAnyError = !this.form.value;
    });
  }
}
