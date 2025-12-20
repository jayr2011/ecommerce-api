/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../../src/common/guards/jwt-auth.guard';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '../../../src/auth/decorators/public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getRequest', () => {
    it('should extract request from GraphQL context', () => {
      const mockRequest = { headers: { authorization: 'Bearer token' } };
      const mockContext = {
        getContext: jest.fn().mockReturnValue({ req: mockRequest }),
      };

      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockContext as any);

      const executionContext = {} as ExecutionContext;
      const result = guard.getRequest(executionContext);

      expect(GqlExecutionContext.create).toHaveBeenCalledWith(executionContext);
      expect(mockContext.getContext).toHaveBeenCalled();
      expect(result).toBe(mockRequest);
    });

    it('should call getContext with correct type parameter', () => {
      const mockRequest = { user: { id: 1 } };
      const mockGetContext = jest.fn().mockReturnValue({ req: mockRequest });
      const mockContext = {
        getContext: mockGetContext,
      };

      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(mockContext as any);

      const executionContext = {} as ExecutionContext;
      guard.getRequest(executionContext);

      expect(mockGetContext).toHaveBeenCalled();
    });
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;
    let mockHandler: any;
    let mockClass: any;

    beforeEach(() => {
      mockHandler = jest.fn();
      mockClass = jest.fn();
      mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(mockHandler),
        getClass: jest.fn().mockReturnValue(mockClass),
        switchToHttp: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getType: jest.fn(),
      } as any;
    });

    it('should return true if route is marked as public', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockHandler,
        mockClass,
      ]);
      expect(result).toBe(true);
    });

    it('should call super.canActivate if route is not public', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      void guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockHandler,
        mockClass,
      ]);
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);

      superCanActivateSpy.mockRestore();
    });

    it('should call super.canActivate if isPublic is undefined', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      void guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockHandler,
        mockClass,
      ]);
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);

      superCanActivateSpy.mockRestore();
    });

    it('should call super.canActivate if isPublic is null', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      void guard.canActivate(mockExecutionContext);

      expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);

      superCanActivateSpy.mockRestore();
    });

    it('should check metadata on both handler and class', () => {
      const getAllAndOverrideSpy = jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(false);

      jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      void guard.canActivate(mockExecutionContext);

      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockHandler,
        mockClass,
      ]);
      expect(mockExecutionContext.getHandler).toHaveBeenCalled();
      expect(mockExecutionContext.getClass).toHaveBeenCalled();
    });

    it('should prioritize handler metadata over class metadata (getAllAndOverride behavior)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return result from super.canActivate when not public', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      const mockSuperResult = Promise.resolve(true);
      const superCanActivateSpy = jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(mockSuperResult);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(mockSuperResult);

      superCanActivateSpy.mockRestore();
    });
  });

  describe('integration with Reflector', () => {
    it('should use Reflector to check for public metadata', () => {
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(jest.fn()),
        getClass: jest.fn().mockReturnValue(jest.fn()),
      } as any;

      const getAllAndOverrideSpy = jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue(true);

      void guard.canActivate(mockExecutionContext);

      expect(getAllAndOverrideSpy).toHaveBeenCalledTimes(1);
      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(
        IS_PUBLIC_KEY,
        expect.any(Array),
      );
    });

    it('should pass correct targets to getAllAndOverride', () => {
      const handler = jest.fn();
      const classRef = jest.fn();
      const mockExecutionContext = {
        getHandler: jest.fn().mockReturnValue(handler),
        getClass: jest.fn().mockReturnValue(classRef),
      } as any;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
      jest
        .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
        .mockReturnValue(true);

      void guard.canActivate(mockExecutionContext);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        handler,
        classRef,
      ]);
    });
  });
});
