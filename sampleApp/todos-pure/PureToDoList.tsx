import React from "react";
import styled from "styled-components";
import { PureToDoItem } from "./PureToDoItem";
import { usePureToDos } from "./PureToDosProvider";

export const PureToDoList = () => {
  const { todos } = usePureToDos();

  return (
    <ToDoListWrapper>
      {todos.map((item, i) => (
        <PureToDoItem key={item.value} itemIndex={i} />
      ))}
    </ToDoListWrapper>
  );
};

const ToDoListWrapper = styled.div`
  text-align: left;
`;
