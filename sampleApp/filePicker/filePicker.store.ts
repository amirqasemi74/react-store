import { ContextStore, Props, Effect, dep } from "react-over";
import { Props as FilePickerProps } from ".";

@ContextStore()
export default class FilePickerStore {
  @Props
  props: FilePickerProps;

  files: FileInfo[] = [];

  @Effect()
  onNewFileIds() {
    console.log(this.props.fileIds);
  }

  onDrop(acceptedFiles: File[]) {
    acceptedFiles.forEach((file) => {
      this.files.push({ file, status: "uploading", progress: 0 });
      this.props.onUpload(file, this.onProgress(file), this.onComplete(file));
    });
  }

  onProgress(file: File) {
    return (progress: number) => {
      const i = this.files.findIndex((fileInfo) => fileInfo.file === file);
      this.files[i].progress = progress;
    };
  }

  onComplete(file: File) {
    return () => {
      const i = this.files.findIndex((fileInfo) => fileInfo.file === file);
      console.log("uploaded", i);
      this.files[i].status = "uploaded";
    };
  }
}

interface FileInfo {
  file: File;
  status: "uploading" | "uploaded" | "error";
  progress: number;
}
