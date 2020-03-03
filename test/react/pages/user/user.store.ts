import { ChangeEvent } from "react";
import { ContextualStore, Props } from "react-vm";
import { UserPageProps } from ".";

@ContextualStore()
export default class UserStore {
  username = "amir.qsasemi";

  password = "725," + Math.floor(Math.random() * 100);

  @Props
  private props: UserPageProps;

  didMount() {
    console.log("Hi didmoutns", this.props);
  }

  onUsernameChange(e: ChangeEvent<HTMLInputElement>) {
    this.username = e.target.value;
  }

  onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    this.password = e.target.value;
  }
}
