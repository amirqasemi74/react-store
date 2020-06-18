import React from "react";
import { connectToStore, useStore } from "react-over";
import { ToDoStore } from "./toDo.store";
import styled from "styled-components";
import ToDoList from "./ToDoList";

const ToDos: React.FC = () => {
  const vm = useStore(ToDoStore);
  return (
    <ToDoWrapper>
      <Title>To Do Application</Title>
      <TodoInput
        placeholder="Enter to do"
        value={vm.inputVal}
        onChange={vm.onInputChange.bind(vm)}
        onKeyDown={vm.onInputKeyDown.bind(vm)}
      />
      <ToDoList />
      <ToDoCount>To Do Count: {vm.todos.length}</ToDoCount>
    </ToDoWrapper>
  );
};

export default connectToStore(ToDos, ToDoStore);

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
  border-top: 1px solid;
  margin-top: 20px;
  padding-top: 20px;
`;
