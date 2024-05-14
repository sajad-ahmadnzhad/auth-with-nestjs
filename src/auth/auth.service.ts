import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/schemas/User.schema";
import { Model } from "mongoose";
import { SignupUserDto } from "./dto/signupUser.dto";
import { AuthMessages } from "./auth.message";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { SignupUser } from "./auth.interface";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private redisCache: RedisCache
  ) {}

  private hashData(data: string, salt: number) {
    return bcrypt.hashSync(data, salt);
  }

  private generateToken(
    payload: object,
    expireTime: number | string,
    secretKey: string
  ) {
    return this.jwtService.sign(payload, {
      expiresIn: expireTime,
      secret: secretKey,
    });
  }

  async createUser(dto: SignupUserDto): Promise<SignupUser> {
    const { username, email } = dto;

    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException(AuthMessages.AlreadyRegistered);
    }

    const isFirstUser = !!(await this.userModel.countDocuments());

    const hashPassword = this.hashData(dto.password, 12);

    const user = await this.userModel.create({
      ...dto,
      isAdmin: isFirstUser,
      isSuperAdmin: isFirstUser,
      password: hashPassword,
    });

    const accessToken = this.generateToken(
      { id: user._id.toString() },
      process.env.ACCESS_TOKEN_EXPIRE_TIME,
      process.env.ACCESS_TOKEN_SECRET
    );

    const refreshToken = this.generateToken(
      { id: user._id },
      process.env.REFRESH_TOKEN_EXPIRE_TIME,
      process.env.ACCESS_TOKEN_SECRET
    );

    await this.redisCache.set(user._id.toString(), refreshToken);

    return { success: AuthMessages.SignupUserSuccess, accessToken };
  }
}
