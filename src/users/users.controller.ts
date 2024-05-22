import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { User } from "src/schemas/User.schema";
import { IsAdminGuard } from "src/guards/isAdmin.guard";
import { AuthGuard } from "src/guards/Auth.guard";
import { IsValidObjectIdPipe } from "./pipes/isValidObjectId.pipe";
import { UserDecorator } from "./decorators/currentUser.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { UserAvatarPipe } from "./pipes/user-avatar.pipe";
import { diskStorage } from "multer";
import * as path from "path";
import {
  GetAllUsersDecorator,
  GetMeDecorator,
  GetOneUserDecorator,
  RemoveUserDecorator,
  UpdateUserDecorator,
} from "./decorators/users.decorator";

@Controller("users")
@ApiTags("users")
@ApiCookieAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @GetMeDecorator
  getMe(@UserDecorator() user: User): User {
    return user;
  }

  @Get()
  @GetAllUsersDecorator
  findAllUsers(): Promise<Array<User>> {
    return this.usersService.findAllUsers();
  }

  @Get(":userId")
  @GetOneUserDecorator
  findUser(
    @Param("userId", IsValidObjectIdPipe) userId: string
  ): Promise<User> {
    return this.usersService.findUser(userId);
  }

  @Patch("/")
  @UpdateUserDecorator
  async update(
    @UserDecorator() user: User,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(UserAvatarPipe) file?: Express.Multer.File
  ): Promise<{ message: string }> {
    const success = await this.usersService.update(
      user,
      updateUserDto,
      file?.filename
    );

    return { message: success };
  }

  @Delete(":userId")
  @RemoveUserDecorator
  async removeUser(
    @Param("userId", IsValidObjectIdPipe) userId: string,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.usersService.removeUser(userId, user);

    return { message: success };
  }
}
