import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  @MinLength(8)
  password: string;
}
