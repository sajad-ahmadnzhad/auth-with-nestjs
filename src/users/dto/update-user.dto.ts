import { ApiProperty, PartialType } from "@nestjs/swagger";
import { SignupUserDto } from "../../auth/dto/signupUser.dto";

export class UpdateUserDto extends PartialType(SignupUserDto) {
  @ApiProperty({ type: "string", format: "binary" , required: false })
  avatar: any;
}
