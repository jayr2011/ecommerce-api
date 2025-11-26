import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../../auth/decorators/roles.decoretor';
import { RequestWithUser, JwtPayload } from 'src/types/auth.types';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (
    user?: any,
    requiredRoles?: string[] | null,
  ): ExecutionContext => {
    const mockRequest: Partial<RequestWithUser> = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      user,
    };

    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getType: jest.fn().mockReturnValue('http'),
      getArgs: jest
        .fn()
        .mockReturnValue([null, null, { req: mockRequest }, null]),
      getHandler: jest.fn().mockReturnValue({ name: 'testHandler' }),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    if (requiredRoles !== undefined) {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(requiredRoles as string[]);
    }

    return context;
  };

  describe('canActivate', () => {
    it('should return true when no roles are required', () => {
      const context = createMockExecutionContext(undefined, []);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      const spy = jest.spyOn(reflector, 'getAllAndOverride');
      guard.canActivate(context);
      expect(spy).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should return true when required roles is null', () => {
      const context = createMockExecutionContext(undefined, null);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when user is not authenticated', () => {
      const context = createMockExecutionContext(undefined, ['ADMIN']);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(context)).toThrow(
        'User not authenticated',
      );
    });

    it('should throw ForbiddenException when user has no roles', () => {
      const user = {
        sub: 'user-123',
        email: 'test@test.com',
      } as JwtPayload;
      const context = createMockExecutionContext(user, ['ADMIN']);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'You do not have permission to access this resource',
      );
    });

    it('should return true when user has required role (single role as string)', () => {
      const user = {
        sub: 'user-123',
        email: 'test@test.com',
        role: 'ADMIN' as const,
      };
      const context = createMockExecutionContext(user, ['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when user has required role (role as array)', () => {
      const user = {
        sub: 'user-123',
        email: 'test@test.com',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        role: ['USER', 'ADMIN'] as any,
      };
      const context = createMockExecutionContext(user, ['ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when user has one of multiple required roles', () => {
      const user = {
        sub: 'user-123',
        email: 'test@test.com',
        role: 'USER' as const,
      };
      const context = createMockExecutionContext(user, ['USER', 'ADMIN']);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user does not have required role', () => {
      const user = {
        sub: 'user-123',
        email: 'test@test.com',
        role: 'USER' as const,
      };
      const context = createMockExecutionContext(user, ['ADMIN']);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'You do not have permission to access this resource',
      );
    });

    it('should throw ForbiddenException when user roles do not match any required roles', () => {
      const user = {
        sub: 'user-123',
        email: 'test@test.com',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        role: ['USER'] as any,
      };
      const context = createMockExecutionContext(user, ['ADMIN', 'MODERATOR']);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should handle user without sub field', () => {
      const user = {
        email: 'test@test.com',
        role: 'USER',
      };
      const context = createMockExecutionContext(user, ['ADMIN']);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should filter out falsy values from role array', () => {
      const user = {
        sub: 'user-123',
        email: 'test@test.com',
        role: undefined,
      } as JwtPayload;
      const context = createMockExecutionContext(user, ['ADMIN']);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
