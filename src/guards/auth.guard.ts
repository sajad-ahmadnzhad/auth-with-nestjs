import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { User } from "../schemas/User.schema";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request;

    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw new ForbiddenException("This path is protected !!");
    }

    let jwtPayload: null | { id: string } = null;

    try {
      jwtPayload = this.jwtService.verify<{ id: string }>(accessToken, {
        secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
      });
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }

    const user = await this.userModel.findById(jwtPayload?.id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (req.url !== "/users" && req.method !== "PATCH")
      if (!user.isVerifyEmail) {
        throw new ForbiddenException(
          "Verify your email before accessing this site"
        );
      }

    req.user = user;

    return true;
  }
}
