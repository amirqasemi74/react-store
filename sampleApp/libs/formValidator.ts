import { Service, Effect } from "@react-store/core";

@Service()
export default class FormValidator {
  hasAnyError = false;

  constructor(private form: any) {}

  @Effect()
  onErrorChange() {
    console.log("Changed", this.hasAnyError);
  }
  validate() {
    this.hasAnyError = !this.form.value;
  }
}
