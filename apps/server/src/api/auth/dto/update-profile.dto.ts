import { CreateUserDto } from '@app/server/api/users/dto/create-user.dto';
import { PickType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';

export class UpdateProfileDto extends PartialType(
  PickType(CreateUserDto, ['email']),
) {}
