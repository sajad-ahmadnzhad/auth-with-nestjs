import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupUserDto } from "./dto/signupUser.dto";


@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signup')
  signupUser(@Body() body: SignupUserDto) {
    console.log(body);
  }

}
