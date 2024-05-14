import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupUserDto } from "./dto/signupUser.dto";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signupUser(
    @Body() body: SignupUserDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ message: string }> {
    const { success, accessToken } = await this.authService.createUser(body);
    res.cookie("accessToken", accessToken, { secure: true, httpOnly: true });
    return { message: success };
  }
}
