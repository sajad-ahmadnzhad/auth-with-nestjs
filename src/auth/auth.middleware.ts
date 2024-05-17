import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NestMiddleware,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { NextFunction, Request, Response } from "express";
import { Model } from "mongoose";
import { User } from "src/schemas/User.schema";
import { AuthMessages } from "./auth.message";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw new ForbiddenException("This path is protected !!");
    }

    try {
      const jwtPayload = this.jwtService.verify<{ id: string }>(accessToken, {
        secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
      });

      const user = await this.userModel.findById(jwtPayload.id);

      if (!user) {
        throw new NotFoundException(AuthMessages.NotFoundUser);
      }

      req.user = user;

      next();
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
