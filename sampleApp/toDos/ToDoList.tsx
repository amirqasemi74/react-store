import ToDoItem from "./ToDoItem";
import { ToDoStore } from "./toDo.store";
import { useStore } from "@react-store/core";
import React from "react";
import styled from "styled-components";

const ToDoList = () => {
  const vm = useStore(ToDoStore);
  return (
    <ToDoListWrapper>
      {vm.todos.map((item, i) => (
        <ToDoItem key={item.id} itemIndex={i} />
      ))}
    </ToDoListWrapper>
  );
};

export default ToDoList;

const ToDoListWrapper = styled.div`
  text-align: left;
`;
