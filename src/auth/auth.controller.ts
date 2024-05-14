import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupUserDto } from "./dto/signupUser.dto";
import { Request, Response } from "express";
import { SigninUserDto } from "./dto/signinUser.dot";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(
    @Body() body: SignupUserDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    const { success, accessToken } = await this.authService.signupUser(body);
    res.cookie("accessToken", accessToken, { secure: true, httpOnly: true });
    return { message: success };
  }

  @Post("signin")
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() body: SigninUserDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    const { success, accessToken } = await this.authService.signinUser(body);
    res.cookie("accessToken", accessToken);

    return { message: success };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken } = req.cookies || {};

    const { success, newAccessToken } =
      await this.authService.refreshToken(accessToken);

    res.cookie("accessToken", newAccessToken);

    return { message: success };
  }
}
