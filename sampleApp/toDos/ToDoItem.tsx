import React from "react";
import { useStore } from "@react-store/core";
import styled from "styled-components";
import ToDoStore from "./toDo.store";

interface Props {
  itemIndex: number;
}

const ToDoItem: React.FC<Props> = React.memo(({ itemIndex }) => {
  const vm = useStore(ToDoStore, ({ todos }) => [todos[itemIndex]]);

  return (
    <ToDoItemWrapper>
      <span>
        {itemIndex + 1}-
        {vm.todos[itemIndex].isEditing ? (
          <input
            defaultValue={vm.todos[itemIndex].value}
            onKeyDown={(e) => vm.onToDoItemInputKeyDown(e, itemIndex)}
          />
        ) : (
          " " + vm.todos[itemIndex].value
        )}
      </span>
      <ActionWrapper>
        <button onClick={() => vm.removeTodo(itemIndex)}>remove</button>
        <button onClick={() => vm.setToDoItemIsEditing(itemIndex)}>edit</button>
      </ActionWrapper>
    </ToDoItemWrapper>
  );
});

export default ToDoItem;

const ToDoItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
`;
const ActionWrapper = styled.section`
  button {
    margin-left: 5px;
  }
`;
