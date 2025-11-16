import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'a957...',
    description: 'Refresh token issued at login or when rotating',
  })
  refreshToken: string;
}

export class TokenResponseDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1...',
    description: 'JWT access token',
  })
  access_token: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'a957...',
    description: 'Opaque refresh token for rotating sessions',
  })
  refresh_token: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Bearer' })
  token_type: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 900,
    description: 'Lifetime of access token, in seconds',
  })
  expires_in: number;
}
