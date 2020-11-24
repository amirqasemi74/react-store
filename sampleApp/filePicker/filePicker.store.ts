import { Store, Effect, Props } from "@react-store/core";
import { Props as FilePickerProps } from ".";

@Store()
export default class FilePickerStore {
  @Props
  props: FilePickerProps;

  filesInfo: FileInfo[] = [];

  @Effect()
  onNewFileIds() {
    console.log(this.props.fileIds);
  }

  onDrop(acceptedFiles: File[]) {
    acceptedFiles.forEach((file) => {
      this.filesInfo.push({
        id: Math.random().toString(),
        file,
        status: "uploading",
        progress: 0,
      });
      this.props.onUpload(file, this.onProgress(file), this.onComplete(file));
    });
  }

  onProgress(file: File) {
    return (progress: number) => {
      const i = this.filesInfo.findIndex((fileInfo) => fileInfo.file === file);
      this.filesInfo[i].progress = progress;
    };
  }

  onComplete(file: File) {
    return () => {
      const i = this.filesInfo.findIndex((fileInfo) => fileInfo.file === file);
      console.log("uploaded", i);
      this.filesInfo[i].status = "uploaded";
    };
  }

  removeFileItem(fileId: string) {
    const i = this.filesInfo.findIndex((f) => f.id === fileId);
    this.filesInfo.splice(i, 1);
  }
}

export interface FileInfo {
  id: string;
  file: File;
  status: "uploading" | "uploaded" | "error";
  progress: number;
}
