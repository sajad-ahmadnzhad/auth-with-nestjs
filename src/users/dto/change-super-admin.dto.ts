import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ChangeSuperAdminDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
}
