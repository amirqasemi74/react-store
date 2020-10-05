import { Service, Effect } from "@react-store/core";

@Service()
export default class FormValidator {
  hasAnyError = false;

  constructor(private form: any) {}

  @Effect()
  onErrorChange() {
    console.log("Changed", this.hasAnyError);
  }
  
  async validate() {
    await new Promise((res) => res());
    this.hasAnyError = !this.form.value;
  }
}
