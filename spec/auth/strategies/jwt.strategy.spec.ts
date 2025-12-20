import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../../../src/auth/strategies/jwt.strategy';
import { JwtPayload } from 'src/types/auth.types';
import { PrismaService } from 'src/prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const originalEnv = process.env.JWT_SECRET;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-secret-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalEnv;
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should return user object when payload is valid and user exists', async () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        role: 'USER',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567890 + 3600,
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        sub: 'user-123',
        email: 'test@example.com',
        role: 'USER',
        iat: 1234567890,
        exp: 1234567890 + 3600,
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw UnauthorizedException when sub is missing', async () => {
      const payload = {
        role: 'USER',
        email: 'test@example.com',
      } as JwtPayload;

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Invalid token payload',
      );
    });

    it('should throw UnauthorizedException when role is missing', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
      } as JwtPayload;

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Invalid token payload',
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        role: 'USER',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567890 + 3600,
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'User not found',
      );
    });

    it('should throw UnauthorizedException when role mismatch', async () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        role: 'ADMIN',
        email: 'test@example.com',
        iat: 1234567890,
        exp: 1234567890 + 3600,
      };

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(strategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(payload)).rejects.toThrow(
        'Invalid token payload',
      );
    });
  });
});
