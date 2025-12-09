import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/*';
import { RefreshTokenDto, TokenResponseDto } from './dto/refresh-token.dto';
import { JwtPayloadUser } from 'src/types/auth.types';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { name, email, password } = dto;
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) {
      this.logger.warn('Attempt to register existing user: ' + email);
      throw new ConflictException('User already exists');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { name, email, passwordHash, role: 'ADMIN' },
    });
    this.logger.log('Registered new user: ' + email);
    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      this.logger.warn('Failed login attempt for: ' + email);
      throw new UnauthorizedException('Invalid credentials');
    }
    this.logger.log('User logged in: ' + email);
    return this.generateTokens(user);
  }

  async refresh(dto: RefreshTokenDto): Promise<TokenResponseDto> {
    const { refreshToken } = dto;

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      this.logger.warn('Invalid or expired refresh token used');
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
    this.logger.log('Refresh token used for user: ' + storedToken.user.email);

    return this.generateTokens(storedToken.user);
  }

  async logout(userId: string) {
    await this.revokeRefreshToken(userId);
    this.logger.log('User logged out: ' + userId);
    return { message: 'Logged out successfully' };
  }

  async revokeRefreshToken(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
    this.logger.log('Revoked refresh tokens for user: ' + userId);
  }

  private async generateTokens(
    user: JwtPayloadUser,
  ): Promise<TokenResponseDto> {
    const payload = { sub: user.id, email: user.email, role: user.role };
    try {
      const access_token = this.jwt.sign(payload, { expiresIn: '15m' });

      const refreshTokenValue = randomBytes(64).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await this.prisma.refreshToken.create({
        data: {
          token: refreshTokenValue,
          userId: user.id,
          expiresAt,
        },
      });

      this.logger.log('Generated tokens for user: ' + user.email);

      return {
        access_token,
        refresh_token: refreshTokenValue,
        token_type: 'Bearer',
        expires_in: 15 * 60,
      };
    } catch (error) {
      this.logger.error(
        'Error generating tokens for user: ' + user.email,
        error as Error,
      );
      throw error;
    }
  }
}
