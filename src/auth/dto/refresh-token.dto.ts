import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class TokenResponseDto {
  @IsNotEmpty()
  @IsString()
  access_token: string;

  @IsNotEmpty()
  @IsString()
  refresh_token: string;

  @IsNotEmpty()
  @IsString()
  token_type: string;

  @IsNotEmpty()
  expires_in: number;
}
