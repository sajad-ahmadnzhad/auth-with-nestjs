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

  async findUser(userId: string) {
    const user = await this.usersModel.findById(userId);

    if (!user) {
      throw new NotFoundException(UsersMessages.NotFound);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersModel.findById(id);

    if (!user) throw new NotFoundException(UsersMessages.NotFound);

    await user.updateOne({ $set: updateUserDto });

    return UsersMessages.UpdatedSuccess;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
