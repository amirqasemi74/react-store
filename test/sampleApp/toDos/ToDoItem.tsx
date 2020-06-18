import React, { useState, KeyboardEvent } from "react";
import { useStore } from "react-over";
import { ToDoStore } from "./toDo.store";
import styled from "styled-components";

interface Props {
  itemIndex: number;
}

const ToDoItem: React.FC<Props> = ({ itemIndex }) => {
  const vm = useStore(ToDoStore);
  const [isEditing, setIsEditing] = useState(false);
  
  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing((pre) => !pre);
      vm.editTodo(itemIndex, e.currentTarget.value);
    }
  };

  return (
    <ToDoItemWrapper>
      <span>
        {itemIndex + 1}-
        {isEditing ? (
          <input
            defaultValue={vm.todos[itemIndex]}
            onKeyDown={onInputKeyDown}
          />
        ) : (
          " " + vm.todos[itemIndex]
        )}
      </span>
      <ActionWrapper>
        <button onClick={() => vm.removeTodo(itemIndex)}>remove</button>
        <button onClick={() => setIsEditing((pre) => !pre)}>edit</button>
      </ActionWrapper>
    </ToDoItemWrapper>
  );
};

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
