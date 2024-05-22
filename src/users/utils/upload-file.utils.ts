import multer from "multer";
import * as path from "path";

export function uploadDiskStorage(): multer.DiskStorageOptions {
  return {
    filename(req, file, cb) {
      const extname = path.extname(file.originalname);
      const filename = file.originalname?.split(".")?.[0];
      const newFilename = `${Date.now()}${Math.random() * 9999}${filename}${extname}`;
      cb(null, newFilename);
    },
    destination(req, file, cb) {
      cb(null, process.cwd() + "/public/uploads");
    },
  } as multer.DiskStorageOptions;
}
