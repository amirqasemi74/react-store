import React from "react";
import { useStore } from "react-vm";
import UserStore from "./user.store";

const Username = () => {
  const vm = useStore(UserStore);

  return (
    <div>
      <label>Username: </label>
      <input value={vm.username} onChange={vm.onUsernameChange.bind(vm)} />
      <span>{vm.username}</span>
    </div>
  );
};
export default Username;
