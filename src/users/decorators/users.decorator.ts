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
  ApiQuery,
} from "@nestjs/swagger";
import { diskStorage } from "multer";
import { AuthGuard } from "src/guards/Auth.guard";
import { IsAdminGuard } from "src/guards/isAdmin.guard";
import { IsSuperAdminGuard } from "src/guards/isSuperAdmin.guard";
import { uploadDiskStorage } from "../utils/upload-file.utils";

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
  ApiOperation({ summary: "get all users" }),
  ApiQuery({ name: "page", type: Number, required: false }),
  ApiQuery({ name: "limit", type: Number, required: false })
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
      storage: diskStorage(uploadDiskStorage()),
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

//* Change role user decorator
export const ChangeRoleUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard, IsSuperAdminGuard),
  ApiNotFoundResponse({ description: "User not found" }),
  ApiBadRequestResponse({ description: "Cannot change role super admin" }),
  ApiOperation({ summary: "change role user" })
);

//* Search user decorator
export const SearchUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiOperation({ summary: "search in users list" }),
  ApiOkResponse({ description: "Get matched users", type: Object })
);

//* Delete account user decorator
export const DeleteAccountUserDecorator = applyDecorators(
  UseGuards(AuthGuard)
)