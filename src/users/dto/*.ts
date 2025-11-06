import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  id: string;
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
