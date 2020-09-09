import React, { useEffect } from "react";
import { connectStore, useStore } from "@react-store/core";
import ToDoStore from "./toDo.store";
import styled from "styled-components";
import ToDoList from "./ToDoList";

const ToDos: React.FC = () => {
  const vm = useStore(ToDoStore);

  return (
    <ToDoWrapper>
      <Title style={{ color: vm.theme.primary }}>To Do Application</Title>
      <TodoInput
        placeholder="Enter To Do"
        value={vm.inputVal}
        onChange={vm.onInputChange}
        onKeyDown={vm.onInputKeyDown}
      />
      <ToDoList />
      <ToDoCount>ToDo Count: {vm.todoCount}</ToDoCount>
    </ToDoWrapper>
  );
};

export default connectStore(ToDos, ToDoStore);

const ToDoWrapper = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 50px auto;
  padding: 10px 40px;
  width: 500px;
  border: 1px solid gray;
  border-radius: 3px;
`;

const Title = styled.section`
  text-align: center;
  font-size: 40px;
`;

const TodoInput = styled.input`
  width: 100%;
  margin: 30px auto;
  line-height: 40px;
  font-size: 18px;
`;

const ToDoCount = styled.section`
  text-align: center;
  border-top: 1px solid;
  margin-top: 20px;
  padding-top: 10px;
`;
