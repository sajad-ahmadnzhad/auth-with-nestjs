import { BadRequestException, PipeTransform } from "@nestjs/common";
import { isValidObjectId } from "mongoose";

export class IsValidObjectIdPipe implements PipeTransform {
  transform(value: string) {
    if (!isValidObjectId(value))
      throw new BadRequestException("This id is not from mongodb");

    return value;
  }
}
