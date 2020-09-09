import { useStore } from "@react-store/core";
import FilePickerStore from "./filePicker.store";
import React, { memo } from "react";
import styled from "styled-components";

interface Props {
  fileId: string;
}
const FileItem = memo<Props>(({ fileId }) => {
  const { filesInfo, removeFileItem } = useStore(FilePickerStore);
  const fileInfo = filesInfo.find((info) => info.id === fileId);

  if (!fileInfo) {
    return <FileItemWrapper>File info not found</FileItemWrapper>;
  }
  console.log("FileItem", fileInfo.file.name);

  return (
    <FileItemWrapper>
      <p>
        Name: {fileInfo.file.name} ({fileInfo.file.size} B)
      </p>
      <p>
        Status: {fileInfo.status} ({fileInfo.progress.toString()})
      </p>
      <button onClick={() => removeFileItem(fileInfo.id)}>
        Remove File Item
      </button>
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
  font-size: 14px;
`;
