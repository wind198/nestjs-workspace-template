import { IsString, IsStrongPassword } from 'class-validator';

export class ActivateAccountDto {
  @IsString()
  @IsStrongPassword({ minLength: 8 })
  password: string;
}
