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
import { UserDecorator } from "./decorators/user.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from "express";
import { UserAvatarPipe } from "./pipes/user-avatar.pipe";
import { diskStorage } from "multer";
import * as path from "path";

@Controller("users")
@ApiTags("users")
@ApiCookieAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @UseGuards(AuthGuard)
  getMe(@UserDecorator() user: User): User {
    return user;
  }

  @Get()
  @UseGuards(AuthGuard, IsAdminGuard)
  findAllUsers(): Promise<Array<User>> {
    return this.usersService.findAllUsers();
  }

  @Get(":userId")
  @UseGuards(AuthGuard, IsAdminGuard)
  findUser(
    @Param("userId", IsValidObjectIdPipe) userId: string
  ): Promise<User> {
    return this.usersService.findUser(userId);
  }

  @Patch("/")
  @UseGuards(AuthGuard)
  @UseInterceptors(
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
  )
  @ApiConsumes("multipart/form-data")
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
  @UseGuards(AuthGuard, IsAdminGuard)
  async removeUser(
    @Param("userId", IsValidObjectIdPipe) userId: string,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.usersService.removeUser(userId , user);

    return { message: success };
  }
}
