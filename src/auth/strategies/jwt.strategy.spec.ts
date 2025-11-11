import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayload } from 'src/types/auth.types';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  const originalEnv = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key';
    strategy = new JwtStrategy();
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  describe('constructor', () => {
    it('should throw an error if JWT_SECRET is not defined', () => {
      delete process.env.JWT_SECRET;
      expect(() => new JwtStrategy()).toThrow(
        'JWT_SECRET environment variable is not defined',
      );
    });

    it('should initialize successfully with JWT_SECRET defined', () => {
      process.env.JWT_SECRET = 'test-secret';
      expect(() => new JwtStrategy()).not.toThrow();
    });
  });

  describe('validate', () => {
    it('should return user object when payload is valid', () => {
      const payload: JwtPayload = {
        sub: 'user-123',
        role: 'USER',
        email: 'test@example.com',
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        userId: 'user-123',
        role: 'USER',
      });
    });

    it('should throw UnauthorizedException when sub is missing', () => {
      const payload = {
        role: 'USER',
        email: 'test@example.com',
      } as JwtPayload;

      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
      expect(() => strategy.validate(payload)).toThrow('Invalid token payload');
    });

    it('should throw UnauthorizedException when role is missing', () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
      } as JwtPayload;

      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
      expect(() => strategy.validate(payload)).toThrow('Invalid token payload');
    });

    it('should throw UnauthorizedException when both sub and role are missing', () => {
      const payload = {
        email: 'test@example.com',
      } as JwtPayload;

      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
    });
  });
});
