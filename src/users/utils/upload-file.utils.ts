import { BadRequestException } from "@nestjs/common";
import multer from "multer";
import * as path from "path";
import {Request} from 'express'

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

export function fileFilter(req: Request, file: Express.Multer.File , cb: multer.FileFilterCallback) {
  const exts = [".jpg", ".png"];

  const fileExt = path.extname(file.originalname);
  if (!exts.includes(fileExt)) {
   return cb(new BadRequestException("The file extension is invalid"));
  }
  cb(null, true);
}