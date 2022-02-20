import ToDoList from "./ToDoList";
import { ToDoStore } from "./toDo.store";
import { useStore } from "@react-store/core";
import React from "react";
import styled, { css } from "styled-components";

const ToDos: React.FC = () => {
  const vm = useStore(ToDoStore);

  return (
    <ToDoWrapper>
      {/* <Title style={{ color: vm.theme.primary }}>To Do Application</Title>
      <TodoInput
        invalid={vm.validator.hasAnyError}
        value={vm.todo.value}
        onChange={vm.onInputChange}
        onKeyDown={vm.onInputKeyDown}
        placeholder="Enter To Do"
      /> */}
      {/* <ToDoList /> */}
      {/* <ToDoCount>ToDo Count: {vm.todosCount}</ToDoCount> */}
    </ToDoWrapper>
  );
};

export default ToDos;

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

const TodoInput = styled.input<{ invalid: boolean }>`
  width: 100%;
  margin: 30px auto;
  line-height: 40px;
  font-size: 18px;
  border: 1px solid;
  border-radius: 5px;
  ${(props) =>
    props.invalid &&
    css`
      border-color: red;
      outline-color: red;
    `}
`;

const ToDoCount = styled.section`
  text-align: center;
  border-top: 1px solid;
  margin-top: 20px;
  padding-top: 10px;
`;
