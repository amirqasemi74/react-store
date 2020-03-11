import { ChangeEvent, ContextType } from "react";
import { ContextualStore, Props, UseContext } from "react-vm";
import { UserPageProps } from ".";
import { ThemeContext } from "test/react/context/ThemeProvider";

@ContextualStore()
export default class UserStore {
  username = "amir.qsasemi";

  password = "725," + Math.floor(Math.random() * 100);

  @Props
  props: UserPageProps;

  @UseContext(ThemeContext)
  theme: ContextType<typeof ThemeContext>;

  didMount() {
    console.log("Hi didmoutns", this.theme);
  }

  onUsernameChange(e: ChangeEvent<HTMLInputElement>) {
    this.username = e.target.value;
  }

  onPasswordChange(e: ChangeEvent<HTMLInputElement>) {
    this.password = e.target.value;
  }
}
