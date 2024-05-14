import { IsNotEmpty, IsString } from "class-validator";

export class SigninUserDto {
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
