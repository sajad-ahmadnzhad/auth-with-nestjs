import { Body, Controller, Get, Param, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupUserDto } from "./dto/signupUser.dto";
import { Request, Response } from "express";
import { SigninUserDto } from "./dto/signinUser.dot";
import { ForgotPasswordDto } from "./dto/forgotPassword.dto";
import { ResetPasswordDto } from "./dto/resetPassword.dto";
import { SendVerifyEmailDto } from "./dto/sendVerifyEmail.dto";
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";
import {
  SignInUserDecorator,
  RefreshTokenDecorator,
  SignoutUserDecorator,
  ForgotPasswordDecorator,
  ResetPasswordDecorator,
  SendVerifyEmailDecorator,
  VerifyEmailDecorator,
  SignUpUserDecorator,
} from "./decorators/auth.decorator";

@Throttle({ default: { ttl: 60_000, limit: 5 } })
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("signup")
  @SignUpUserDecorator
  async signup(
    @Body() body: SignupUserDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    const { success, accessToken } = await this.authService.signupUser(body);
    res.cookie("accessToken", accessToken, { secure: true, httpOnly: true });
    return { message: success };
  }

  @Post("signin")
  @SignInUserDecorator
  async signin(
    @Body() body: SigninUserDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    const { success, accessToken } = await this.authService.signinUser(body);
    res.cookie("accessToken", accessToken);

    return { message: success };
  }

  @Post("refresh")
  @RefreshTokenDecorator
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

  @Get("signout")
  @SignoutUserDecorator
  async signout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken } = req.cookies;
    const success = await this.authService.signout(accessToken);
    res.clearCookie("accessToken");
    return { message: success };
  }

  @Post("forgot-password")
  @ForgotPasswordDecorator
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const success = await this.authService.forgotPassword(body);

    return { message: success };
  }

  @Post(":userId/reset-password/:token")
  @ResetPasswordDecorator
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Param("userId") userId: string,
    @Param("token") token: string
  ) {
    const success = await this.authService.resetPassword(body, userId, token);

    return { message: success };
  }

  @Post("verify-email")
  @SendVerifyEmailDecorator
  async sendVerifyMail(@Body() body: SendVerifyEmailDto) {
    const success = await this.authService.sendVerifyEmail(body);

    return { message: success };
  }

  @Get(":userId/verify/:token")
  @VerifyEmailDecorator
  async verifyEmail(
    @Param("userId") userId: string,
    @Param("token") token: string
  ) {
    const success = await this.authService.verifyEmail(userId, token);

    return { message: success };
  }
}
