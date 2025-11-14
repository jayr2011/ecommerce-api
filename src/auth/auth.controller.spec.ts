import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/*';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should call authService.register with correct dto', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const expectedResult = {
        access_token: 'token123',
        refresh_token: 'refresh-token-123',
        token_type: 'Bearer',
        expires_in: 900,
      };

      jest.spyOn(authService, 'register').mockResolvedValue(expectedResult);

      await controller.register(registerDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should return the result from authService.register', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };
      const expectedResult = {
        access_token: 'token123',
        refresh_token: 'refresh-token-123',
        token_type: 'Bearer',
        expires_in: 900,
      };

      jest.spyOn(authService, 'register').mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct dto', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = {
        access_token: 'token123',
        refresh_token: 'refresh-token-123',
        token_type: 'Bearer',
        expires_in: 900,
      };

      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

      await controller.login(loginDto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should return the result from authService.login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const expectedResult = {
        access_token: 'token123',
        refresh_token: 'refresh-token-123',
        token_type: 'Bearer',
        expires_in: 900,
      };

      jest.spyOn(authService, 'login').mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResult);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
