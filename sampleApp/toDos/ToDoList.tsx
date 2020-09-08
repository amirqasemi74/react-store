import React from "react";
import { useStore } from "react-store";
import styled from "styled-components";
import ToDoStore from "./toDo.store";
import ToDoItem from "./ToDoItem";

const ToDoList = () => {
  const vm = useStore(ToDoStore);
  return (
    <ToDoListWrapper>
      {vm.todos.map((item, i) => (
        <ToDoItem key={item.value} itemIndex={i} />
      ))}
    </ToDoListWrapper>
  );
};

export default ToDoList;

const ToDoListWrapper = styled.div`
  text-align: left;
`;
