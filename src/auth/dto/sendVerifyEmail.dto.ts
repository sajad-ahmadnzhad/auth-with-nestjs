import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class SendVerifyEmailDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
}
