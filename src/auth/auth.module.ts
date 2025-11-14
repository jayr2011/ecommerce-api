import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthResolver } from './resolver/auth.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';
import { getJwtSecret } from './config/jwt.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { expiresIn: '15m' },
    }),
    PrismaModule,
  ],
  providers: [AuthService, JwtStrategy, AuthResolver],
  controllers: [AuthController],
  exports: [JwtModule],
})
export class AuthModule {}
