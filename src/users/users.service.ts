import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/schemas/User.schema";
import { Model } from "mongoose";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import { UsersMessages } from "./users.message";
import { rimrafSync } from "rimraf";
import { cachePagination, mongoosePagination } from "./utils/pagination.utils";
import { PaginatedUserList } from "./users.interface";
import { DeleteAccountDto } from "./dto/delete-account.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<User>,
    @Inject(CACHE_MANAGER) private redisCache: RedisCache
  ) {}

  async findAllUsers(
    page?: number,
    limit?: number
  ): Promise<PaginatedUserList<User>> {
    const usersCache: User[] = await this.redisCache.get("users");

    if (usersCache) {
      return cachePagination(limit, page, usersCache);
    }

    const query = this.usersModel.find();

    const searchResult = await mongoosePagination(
      limit,
      page,
      query,
      this.usersModel
    );

    const users = await this.usersModel.find();

    await this.redisCache.set("users", users, 30_000);

    return searchResult;
  }

  async findUser(userId: string): Promise<User> {
    const user = await this.usersModel.findById(userId);

    if (!user) {
      throw new NotFoundException(UsersMessages.NotFound);
    }

    return user;
  }

  async update(
    user: User,
    updateUserDto: UpdateUserDto,
    avatarName?: string
  ): Promise<string> {
    if (avatarName) {
      avatarName = `/uploads/${avatarName}`;
    }

    try {
      await this.usersModel.updateOne(
        { email: user.email },
        {
          $set: { ...updateUserDto, avatarURL: avatarName },
        }
      );
    } catch (error) {
      rimrafSync(`${process.cwd()}/public/${avatarName}`);
      throw new HttpException(error.message, error.status);
    }

    return UsersMessages.UpdatedSuccess;
  }

  async removeUser(userId: string, user: User): Promise<string> {
    const foundUser = await this.usersModel.findById(userId);

    if (!foundUser) throw new NotFoundException(UsersMessages.NotFound);

    if ((foundUser.isAdmin && !user.isSuperAdmin) || foundUser.isAdmin) {
      throw new BadRequestException(UsersMessages.CannotRemoveAdmin);
    }

    if (foundUser.isSuperAdmin) {
      throw new BadRequestException(UsersMessages.CannotRemoveSuperAdmin);
    }

    await foundUser.deleteOne();

    return UsersMessages.RemovedSuccess;
  }

  async changeRoleUser(userId: string): Promise<string> {
    const user = await this.usersModel.findById(userId);

    if (!user) throw new NotFoundException(UsersMessages.NotFound);

    if (user.isSuperAdmin) {
      throw new BadRequestException(UsersMessages.CannotChangeRoleSuperAdmin);
    }

    await user.updateOne({ isAdmin: !user.isAdmin });

    return UsersMessages.ChangeRoleSuccess;
  }

  async searchUser(user: string): Promise<Array<User>> {
    if (!user) {
      throw new BadRequestException(UsersMessages.RequiredUser);
    }

    const foundUsers = await this.usersModel.find({
      $or: [
        {
          name: { $regex: user },
          username: { $regex: user },
          email: { $regex: user },
        },
      ],
    });

    return foundUsers;
  }

  async deleteAccount(user: User, dto: DeleteAccountDto): Promise<string> {
    const foundUser = await this.usersModel
      .findOne({ email: user.email })
      .select("password")!;

    if (foundUser.isSuperAdmin) {
      throw new BadRequestException(
        UsersMessages.TransferOwnershipForDeleteAccount
      );
    }

    const comparePassword = bcrypt.compareSync(
      dto.password,
      foundUser.password
    );

    if (!comparePassword) {
      throw new BadRequestException(UsersMessages.InvalidPassword);
    }

    await foundUser.deleteOne();

    return UsersMessages.DeletedAccountSuccess;
  }
}
