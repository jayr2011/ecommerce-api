import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from '../auth.service';
import { RegisterInput } from '../inputs/register.input';
import { LoginInput } from '../inputs/login.input';

const mockAuthService = {
  register: jest
    .fn()
    .mockResolvedValue({ access_token: 'mocked-register-token' }),
  login: jest.fn().mockResolvedValue({ access_token: 'mocked-login-token' }),
};

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('healthCheck returns OK', () => {
    expect(resolver.healthCheck()).toBe('OK');
  });

  it('register calls authService.register with input', async () => {
    const input = { email: 'a@b.com', password: 'secret' } as RegisterInput;
    await resolver.register(input);
    expect(mockAuthService.register).toHaveBeenCalledWith(input);
  });

  it('register returns access_token', async () => {
    const input = { email: 'a@b.com', password: 'secret' } as RegisterInput;
    const result = await resolver.register(input);
    expect(result).toBe('mocked-register-token');
  });

  it('login calls authService.login with input', async () => {
    const input = { email: 'a@b.com', password: 'secret' } as LoginInput;
    await resolver.login(input);
    expect(mockAuthService.login).toHaveBeenCalledWith(input);
  });

  it('login returns access_token', async () => {
    const input = { email: 'a@b.com', password: 'secret' } as LoginInput;
    const result = await resolver.login(input);
    expect(result).toBe('mocked-login-token');
  });
});
