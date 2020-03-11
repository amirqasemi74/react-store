import React from "react";
import { useStore } from "react-over";
import UserStore from "./user.store";

const Password = () => {
  const vm = useStore(UserStore);
  return (
    <div>
      <label>Password: </label>
      <input value={vm.password} onChange={vm.onPasswordChange.bind(vm)} />
      <span>{vm.password}</span>
    </div>
  );
};
export default Password;
