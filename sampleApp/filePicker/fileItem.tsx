import { useStore } from "react-over";
import FilePickerStore from "./filePicker.store";
import React, { memo } from "react";
import styled from "styled-components";

interface Props {
  fileId: string;
}
const FileItem: React.FC<Props> = memo(({ fileId }) => {
  const { files } = useStore(FilePickerStore);
  const fileInfo = files[Number(fileId)];
  console.log("FileItem", fileId);

  return (
    <FileItemWrapper>
      <p>name: {fileInfo.file.name}</p>
      <p>size: {fileInfo.file.size} B</p>
      <p>type: {fileInfo.file.type}</p>
      <p>status: {fileInfo.status}</p>
      <p>progress: {fileInfo.progress}</p>
    </FileItemWrapper>
  );
});

export default FileItem;

const FileItemWrapper = styled.div`
  width: 500px;
  margin-top: 3px;
  padding: 0 5px;
  border: 1px solid;
  border-radius: 3px;
  box-sizing: border-box;
`;
