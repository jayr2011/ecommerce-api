import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    description: 'User UUID',
  })
  id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Admin User', description: "User's full name" })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'admin@example.com',
    description: "User's email address",
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'ADMIN',
    enum: ['ADMIN', 'USER'],
    description: "User's role in the system",
  })
  role: string;

  @IsNotEmpty()
  @IsNotEmpty()
  @ApiProperty({
    example: '2023-11-23T10:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;
}

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'New Name',
    description: "New user's name",
    required: false,
  })
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({
    example: 'new-email@example.com',
    description: "New user's email",
    required: false,
  })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'newPassword123',
    description: "New user's plain text password",
    required: false,
  })
  password?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    example: 'USER',
    enum: ['ADMIN', 'USER'],
    description: 'New role for the user',
    required: false,
  })
  role?: Role;
}
