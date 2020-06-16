import React from "react";
import { useStore, conntectToStore } from "react-over";
import Password from "./Password";
import UserStore from "./user.store";
import Username from "./Username";

export interface UserPageProps {
  username: string;
}

const UserPage = conntectToStore<UserPageProps>((props) => {
  const vm = useStore(UserStore);
  return (
    <div>
      <Username />
      <Password />
      <p>
        user: {vm.username} <br /> pass: {vm.password}
      </p>
      <br />
      <p>theme.colors.primary: {vm.theme?.colors.primary}</p>
    </div>
  );
}, UserStore);

export default UserPage;
