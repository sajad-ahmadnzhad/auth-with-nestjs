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

@Controller("users")
@ApiTags("users")
@ApiCookieAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard, IsAdminGuard)
  findAllUsers(): Promise<Array<User>> {
    return this.usersService.findAllUsers();
  }

  @Get(":id")
  @UseGuards(AuthGuard, IsAdminGuard)
  findUser(@Param("id", IsValidObjectIdPipe) id: string) {
    return this.usersService.findUser(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }
}
