import { useStore } from "@react-store/core";
import React, { useState } from "react";
import ThemeStore from "sampleApp/theme.store";
import styled, { css } from "styled-components";
import { PureToDoList } from "./PureToDoList";
import { usePureToDos } from "./PureToDosProvider";
import { useValidator } from "./useValidator";

export const PureToDos: React.FC = () => {
  const vm = useStore(ThemeStore);
  const [val, setVale] = useState("");
  const isInvalid = useValidator(val);
  const { setTodos, todos, todosCount } = usePureToDos();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVale(e.target.value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      val &&
      !todos.find(({ value }) => value === e.currentTarget.value)
    ) {
      setVale("");
      setTodos((pre) => [...pre, { value: val, isEditing: false }]);
    }
  };

  return (
    <ToDoWrapper>
      <Title style={{ color: vm.primary }}>To Do Application</Title>
      <TodoInput
        value={val}
        invalid={isInvalid}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Enter To Do"
      />
      <PureToDoList />
      <ToDoCount>ToDo Count: {todosCount}</ToDoCount>
    </ToDoWrapper>
  );
};

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
