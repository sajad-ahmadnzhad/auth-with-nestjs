import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class SignupUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  @MinLength(2)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, { message: "Invalid username" })
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @MinLength(8)
  password: string;
}
