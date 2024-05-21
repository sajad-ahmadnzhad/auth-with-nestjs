import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { User } from "src/schemas/User.schema";
import { IsAdminGuard } from "src/guards/isAdmin.guard";
import { AuthGuard } from "src/guards/Auth.guard";
import { IsValidObjectIdPipe } from "./pipes/isValidObjectId.pipe";
import { UserDecorator } from "./decorators/user.decorator";

@Controller("users")
@ApiTags("users")
@ApiCookieAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @UseGuards(AuthGuard)
  getMe(@UserDecorator() user: User) {
    return user;
  }

  @Get()
  @UseGuards(AuthGuard, IsAdminGuard)
  findAllUsers(): Promise<Array<User>> {
    return this.usersService.findAllUsers();
  }

  @Get(":userId")
  @UseGuards(AuthGuard, IsAdminGuard)
  findUser(@Param("userId", IsValidObjectIdPipe) userId: string) {
    return this.usersService.findUser(userId);
  }

  @Patch(":userId")
  async update(
    @Param("userId", IsValidObjectIdPipe) userId: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<{ message: string }> {
    const success = await this.usersService.update(userId, updateUserDto);

    return { message: success };
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }
}
