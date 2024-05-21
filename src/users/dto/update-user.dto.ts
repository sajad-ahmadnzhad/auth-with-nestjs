import { PartialType } from '@nestjs/swagger';
import { SignupUserDto } from '../../auth/dto/signupUser.dto';

export class UpdateUserDto extends PartialType(SignupUserDto) {}
