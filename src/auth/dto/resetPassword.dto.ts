import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(40)
  @MinLength(8)
  @ApiProperty()
  password: string;
}
