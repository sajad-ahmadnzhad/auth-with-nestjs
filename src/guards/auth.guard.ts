import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { User } from "src/schemas/User.schema";
import { GuardMessages } from "./guard.message";

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest() as Request;
    const { accessToken } = request.cookies || {};

    if (!accessToken) return false;

    let jwtPayload = null;

    try {
      jwtPayload = this.jwtService.verify<{ id: string }>(accessToken, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
    } catch (error: any) {
      throw new Error(error.message);
    }

    if (jwtPayload) {
      const user = await this.userModel.findById(jwtPayload.id);

      if (!user) return false;

      if (!user.isVerifyEmail) {
        throw new ForbiddenException(GuardMessages.VerifyEmail);
      }

      request.user = user;
    }

    return true;
  }
}
