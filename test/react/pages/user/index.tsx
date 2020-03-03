import React from "react";
import { createStoreContext, useStore } from "react-vm";
import Password from "./Password";
import UserStore from "./user.store";
import Username from "./Username";

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

export interface UserPageProps {
  username: string;
}

const UserContext = createStoreContext(UserStore);

export default UserPage;
