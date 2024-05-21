import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SigninUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  identifier: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
}
