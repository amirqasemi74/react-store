import React from "react";
import { useDropzone } from "react-dropzone";
import { connectStore, useStore } from "react-store";
import styled from "styled-components";
import FilePickerStore from "./filePicker.store";
import FileItem from "./fileItem";

export interface Props {
  fileIds?: string[];
  onUpload: (
    file: File,
    onProgress: (value: number) => void,
    onCompelete: () => void
  ) => void;
}

const FilePicker = connectStore<Props>(() => {
  const { onDrop, filesInfo } = useStore(FilePickerStore);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });
  console.log("FilePicker");
  return (
    <Wrapper>
      <DragAreaWrapper {...getRootProps()} active={isDragActive}>
        <p>فایل را بکشید یا کلیک کنید</p>
        <input {...getInputProps()} />
      </DragAreaWrapper>
      {filesInfo.map((info) => (
        <FileItem key={info.id} fileId={info.id} />
      ))}
    </Wrapper>
  );
}, FilePickerStore);

export default FilePicker;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 30px;
`;
const DragAreaWrapper = styled.div<{ active?: boolean }>`
  width: 500px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dotted lightblue;
  border-radius: 3px;
  background: ${(props) => (props.active ? "blue" : "none")};
`;
