import { IsEmail, IsNotEmpty } from "class-validator";

export class SendVerifyEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
