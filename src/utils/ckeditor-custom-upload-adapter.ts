/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileLoader } from "ckeditor5";
import { uploadCatalogueImages } from "../api/Catalogue/catalogue";

export class CustomUploadAdapter {
  private loader: FileLoader; // FileLoader instance provided by CKEditor

  constructor(loader: FileLoader) {
    this.loader = loader;
  }

  // Starts the upload process
  async upload(): Promise<{ default: string }> {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          if (!file) return;
          return uploadCatalogueImages(file)
            .then((url) => {
              resolve({
                default: url.data, // Return the uploaded file's URL
              });
            })
            .catch((error) => {
              reject(error.message || "Upload failed");
            });
        }),
    );
  }

  // Aborts the upload process
  abort(): void {
    // Optional: handle aborting the upload if needed
  }
}
