import React from "react";
import { createStoreContext, useStore } from "react-vm";
import Password from "./Password";
import UserStore from "./user.store";
import Username from "./Username";

export interface UserPageProps {
  username: string;
}

const UserPage: React.FC<UserPageProps> = props => {
  const vm = useStore(UserStore);

  return (
    <UserContext props={props}>
      <div>
        <Username />
        <Password />
        <p>
          user: {vm.username} <br /> pass: {vm.password}
        </p>
        <br />
      </div>
    </UserContext>
  );
};

const UserContext = createStoreContext(UserStore);

export default UserPage;
