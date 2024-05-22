import { UseGuards, UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { diskStorage } from "multer";
import * as path from "path";
import { AuthGuard } from "src/guards/Auth.guard";
import { IsAdminGuard } from "src/guards/isAdmin.guard";

//* Get me decorator
export const GetMeDecorator = applyDecorators(
  UseGuards(AuthGuard),
  ApiOperation({ summary: "get my account" }),
  ApiOkResponse({ description: "get account", type: Object })
);

//* Get all users decorator
export const GetAllUsersDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiOkResponse({ description: "Return all users for admins", type: Object }),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiOperation({ summary: "get all users" })
);

//* Get one user decorator
export const GetOneUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiBadRequestResponse({ description: "This id is not from mongodb" }),
  ApiNotFoundResponse({ description: "User not found" }),
  ApiOkResponse({ description: "All users", type: Object }),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiOperation({ summary: "get one user" })
);

//* Update user decorator
export const UpdateUserDecorator = applyDecorators(
  UseGuards(AuthGuard),
  UseInterceptors(
    FileInterceptor("avatar", {
      storage: diskStorage({
        filename(req, file, cb) {
          const extname = path.extname(file.originalname);
          const filename = file.originalname?.split(".")?.[0];
          const newFilename = `${Date.now()}${Math.random() * 9999}${filename}${extname}`;
          cb(null, newFilename);
        },
        destination(req, file, cb) {
          cb(null, process.cwd() + "/public/uploads");
        },
      }),
    })
  ),
  ApiConsumes("multipart/form-data"),
  ApiOperation({ summary: "update current user" }),
  ApiOkResponse({ description: "Updated user success" }),
  ApiConflictResponse({
    description: "already registered with username or email",
  })
);

//* Remove user decorator
export const RemoveUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiNotFoundResponse({ description: "User not found" }),
  ApiBadRequestResponse({ description: "Cannot remove admin" }),
  ApiOperation({ summary: "remove user" })
);
