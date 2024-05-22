import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from "@nestjs/common";
import * as path from "path";

export class UserAvatarPipe implements PipeTransform {
  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!file) return;

    const maxFileSize = 2048 * 1024;

    if (file.size > maxFileSize) {
      throw new BadRequestException(
        "The size of the uploaded file is more than 2 MB"
      );
    }

    const exts = [".jpg", ".png"];

    const fileExt = path.extname(file.originalname);

    if (!exts.includes(fileExt)) {
      throw new BadRequestException("The file extension is invalid");
    }

    return file;
  }
}
