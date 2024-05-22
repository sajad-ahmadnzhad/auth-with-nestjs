import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserSchema } from "src/schemas/User.schema";
import { Model } from "mongoose";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import { UsersMessages } from "./users.message";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private usersModel: Model<User>,
    @Inject(CACHE_MANAGER) private redisCache: RedisCache
  ) {}

  async findAllUsers(): Promise<Array<User>> {
    const usersCache: User[] = await this.redisCache.get("users");

    if (usersCache) return usersCache;

    const users = await this.usersModel.find();

    await this.redisCache.set("users", users, 60_000);

    return this.usersModel.find();
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

    await this.usersModel.updateOne(
      { email: user.email },
      {
        $set: { ...updateUserDto, avatarURL: avatarName },
      }
    );

    return UsersMessages.UpdatedSuccess;
  }

  async removeUser(userId: string): Promise<string> {
    const user = await this.usersModel.findById(userId);

    if (!user) throw new NotFoundException(UsersMessages.NotFound);

    return UsersMessages.RemovedSuccess;
  }
}
