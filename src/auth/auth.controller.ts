import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupUserDto } from "./dto/signupUser.dto";
import { Request, Response } from "express";
import { SigninUserDto } from "./dto/signinUser.dot";
import { AuthGuard } from "src/guards/Auth.guard";
import { ForgotPasswordDto } from "./dto/forgotPassword.dto";
import { ResetPasswordDto } from "./dto/resetPassword.dto";
import { SendVerifyEmailDto } from "./dto/sendVerifyEmail.dto";
import { Throttle } from "@nestjs/throttler";
import {
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
} from "@nestjs/swagger";

@Throttle({ default: { ttl: 60_000, limit: 3 } })
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("signup")
  @ApiConflictResponse({ description: "Already registered user" })
  @ApiCreatedResponse({ description: "Sign Up user success" })
  @ApiOperation({ summary: "Sign Up new user" })
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
  @ApiNotFoundResponse({ description: "Not found user" })
  @ApiForbiddenResponse({ description: "Invalid password or identifier" })
  @ApiOkResponse({ description: "Signin success" })
  @ApiOperation({ summary: "User sign In" })
  async signin(
    @Body() body: SigninUserDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    const { success, accessToken } = await this.authService.signinUser(body);
    res.cookie("accessToken", accessToken);

    return { message: success };
  }

  @Post("refresh")
  @ApiInternalServerErrorResponse({ description: "Jwt expired" })
  @ApiNotFoundResponse({ description: "Refresh token not found" })
  @ApiOkResponse({ description: "Refreshed token success" })
  @ApiOperation({ summary: "Refresh access token" })
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

  @Get("signout")
  @ApiCookieAuth()
  @ApiBadRequestResponse({ description: "Invalid access token" })
  @ApiForbiddenResponse({ description: "This path is protected !!" })
  @ApiOkResponse({ description: "Sign out success" })
  @ApiOperation({ summary: "User sign out" })
  @UseGuards(AuthGuard)
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
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiConflictResponse({ description: "Already send mail" })
  @ApiOkResponse({ description: "Sended reset password" })
  @ApiOperation({ summary: "User forgot password" })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const success = await this.authService.forgotPassword(body);

    return { message: success };
  }

  @Post(":userId/reset-password/:token")
  @ApiNotFoundResponse({ description: "Token not found" })
  @ApiOkResponse({ description: "Reset password success" })
  @ApiOperation({ summary: "User reset password" })
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Param("userId") userId: string,
    @Param("token") token: string
  ) {
    const success = await this.authService.resetPassword(body, userId, token);

    return { message: success };
  }

  @Post("verify-email")
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiConflictResponse({ description: "Already verify email" })
  @ApiConflictResponse({ description: "Already send email" })
  @ApiOkResponse({ description: "Send verify email success" })
  @ApiOperation({ summary: "Send email for verify user" })
  @HttpCode(HttpStatus.OK)
  async sendVerifyMail(@Body() body: SendVerifyEmailDto) {
    const success = await this.authService.sendVerifyEmail(body);

    return { message: success };
  }

  @ApiNotFoundResponse({ description: "Token not found" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiConflictResponse({ description: "Already verify email" })
  @ApiOkResponse({ description: "Verified email success" })
  @ApiOperation({ summary: "Verified user by token" })
  @Get(":userId/verify/:token")
  async verifyEmail(
    @Param("userId") userId: string,
    @Param("token") token: string
  ) {
    const success = await this.authService.verifyEmail(userId, token);

    return { message: success };
  }
}
