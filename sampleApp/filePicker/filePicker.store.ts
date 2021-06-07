import { Effect, Props, Store } from "@react-store/core";
import { Props as FilePickerProps } from ".";

@Store()
export default class FilePickerStore {
  @Props()
  props: FilePickerProps;

  filesInfo = new Map<string, FileInfo>();

  @Effect({ deps: (_: FilePickerStore) => [_.props.fileIds] })
  onNewFileIds() {
    // console.log(this.props.fileIds);
  }

  onDrop(acceptedFiles: File[]) {
    acceptedFiles.forEach((file) => {
      const fileId = Math.random().toString();
      this.filesInfo.set(fileId, {
        file,
        status: "uploading",
        progress: 0,
      });
      this.props.onUpload(
        file,
        this.onProgress(fileId),
        this.onComplete(fileId)
      );
    });
  }

  onProgress(fileId: string) {
    return (progress: number) => {
      const file = this.filesInfo.get(fileId);
      file && (file.progress = progress);
    };
  }

  onComplete(fileId: string) {
    return () => {
      const file = this.filesInfo.get(fileId);
      file && (file.status = "uploaded");
    };
  }

  removeFileItem(fileId: string) {
    this.filesInfo.delete(fileId);
  }
}

export interface FileInfo {
  file: File;
  status: "uploading" | "uploaded" | "error";
  progress: number;
}
