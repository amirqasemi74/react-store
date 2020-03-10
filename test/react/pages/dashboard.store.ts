import { ContextualStore } from "react-vm";

@ContextualStore()
export default class DashboardStore {
  show = true;
  user = "amir.qasemi74";

  toggleShow() {
    console.log(this.show);
    
    this.show = !this.show;
  }
}
