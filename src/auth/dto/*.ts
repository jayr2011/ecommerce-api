import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Admin User', description: "User's full name" })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user@example.com',
    description: "User's email address",
  })
  email: string;

  @MinLength(6)
  @IsNotEmpty()
  @ApiProperty({
    example: 'password123',
    description: 'Plain text password',
    minLength: 6,
  })
  password: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user@example.com',
    description: "User's email address",
  })
  email: string;

  @MinLength(6)
  @IsNotEmpty()
  @ApiProperty({
    example: 'password123',
    description: 'Plain text password',
    minLength: 6,
  })
  password: string;
}
