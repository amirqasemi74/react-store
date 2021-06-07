import React, { memo } from "react";
import styled from "styled-components";
import { usePureToDos } from "./PureToDosProvider";

interface Props {
  itemIndex: number;
}

export const PureToDoItem: React.FC<Props> = memo(({ itemIndex }) => {
  const { todos, removeTodo, setToDoItemIsEditing, onToDoItemInputKeyDown } =
    usePureToDos();

  return (
    <ToDoItemWrapper>
      <span>
        {itemIndex + 1}-
        {todos[itemIndex].isEditing ? (
          <input
            defaultValue={todos[itemIndex].value}
            onKeyDown={(e) => onToDoItemInputKeyDown(e, itemIndex)}
          />
        ) : (
          " " + todos[itemIndex].value
        )}
      </span>
      <ActionWrapper>
        <button onClick={() => removeTodo(itemIndex)}>remove</button>
        <button onClick={() => setToDoItemIsEditing(itemIndex)}>edit</button>
      </ActionWrapper>
    </ToDoItemWrapper>
  );
});

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
