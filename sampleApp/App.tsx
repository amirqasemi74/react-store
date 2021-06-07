import React, { useState } from "react";
import ToDos from "./toDos/ToDos";
import { connectStore, StoreProvider, useStore } from "@react-store/core";
import ThemeStore from "./theme.store";
import FilePicker from "./filePicker";
import ToDoStore from "./toDos/toDo.store";
import { PureToDosProvider } from "./todos-pure/PureToDosProvider";
import { PureToDos } from "./todos-pure/PureToDos";

const App = () => {
  const vm = useStore(ThemeStore);
  return (
    <>
      <button onClick={vm.changePrimary}>change theme</button>
      <StoreProvider type={ToDoStore}>
        <ToDos />
      </StoreProvider>
      {/* <PureToDosProvider>
        <PureToDos />
      </PureToDosProvider> */}
    </>
  );
};

export default connectStore(App, ThemeStore);

// const App = () => {
//   const [fileIds, setFileIds] = useState<string[]>([]);

//   const initFileIDs = () => {
//     setFileIds(["1", "2", "3"]);
//   };
//   const upload = (
//     file: File,
//     onProgress: (value: number) => void,
//     onComplete: () => void
//   ) => {
//     let value = 0;
//     const id = setInterval(() => {
//       onProgress(value > 100 ? 100 : value);
//       if (value >= 100) {
//         onComplete();
//         clearInterval(id);
//       }
//       value += 2;
//     }, 30);
//   };
//   return (
//     <>
//       <button onClick={initFileIDs}>Init File IDs</button>
//       <FilePicker fileIds={fileIds} onUpload={upload} />
//     </>
//   );
// };

// export default App;
