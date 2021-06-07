import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface ToDoItem {
  value: string;
  isEditing: boolean;
}

interface PureToDosContextInterface {
  todos: ToDoItem[];
  todosCount: number;
  setTodos: React.Dispatch<React.SetStateAction<ToDoItem[]>>;
  removeTodo: (index: number) => void;
  setToDoItemIsEditing: (index: number) => void;
  onToDoItemInputKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    itemIndex: number
  ) => void;
}

export const PureToDosProvider: React.FC = ({ children }) => {
  const [todos, setTodos] = useState<ToDoItem[]>([
    { isEditing: false, value: "Job 1" },
  ]);
  const [todosCount, setToDoCount] = useState(0);

  const removeTodo = (index: number) => {
    setTodos((todos) => todos.filter(({}, i) => i !== index));
  };

  const setToDoItemIsEditing = (itemIndex: number) => {
    setTodos((todos) => {
      todos[itemIndex].isEditing = true;
      return [...todos];
    });
  };

  const onToDoItemInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    itemIndex: number
  ) => {
    if (e.key === "Enter") {
      const v = e.currentTarget.value;
      setTodos((todos) => {
        todos[itemIndex].value = v;
        todos[itemIndex].isEditing = false;
        return [...todos];
      });
    }
  };

  useEffect(() => {
    setToDoCount(todos.length);
  }, [todos.length]);

  useEffect(() => {
    setTodos((todos) => {
      for (let i = 2; i < 12; i++) {
        todos.push({ value: "Job " + i.toString(), isEditing: false });
      }
      return [...todos];
    });
  }, []);

  return (
    <PureToDosContext.Provider
      value={{
        todos,
        todosCount,
        setTodos,
        removeTodo,
        setToDoItemIsEditing,
        onToDoItemInputKeyDown,
      }}
    >
      {children}
    </PureToDosContext.Provider>
  );
};

export const usePureToDos = () => {
  const context = useContext(PureToDosContext);
  if (!context) {
    throw new Error("Not provided the PureToDosProvider");
  }
  return context;
};

const PureToDosContext = createContext<PureToDosContextInterface | null>(null);
