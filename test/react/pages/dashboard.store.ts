import { ContextualStore } from "react-over";

@ContextualStore()
export default class DashboardStore {
  show = true;
  user = "amir.qasemi74";

  toggleShow() {
    console.log(this.show);

    this.show = !this.show;
  }
}
