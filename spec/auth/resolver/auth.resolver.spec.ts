import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from '../../../src/auth/resolver/auth.resolver';
import { AuthService } from '../../../src/auth/auth.service';
import { RegisterInput } from '../../../src/auth/inputs/register.input';
import { LoginInput } from '../../../src/auth/inputs/login.input';

const mockAuthService = {
  register: jest
    .fn()
    .mockResolvedValue({ access_token: 'mocked-register-token' }),
  login: jest.fn().mockResolvedValue({ access_token: 'mocked-login-token' }),
  refresh: jest.fn().mockResolvedValue({
    access_token: 'new-access-token',
    refresh_token: 'new-refresh-token',
    token_type: 'Bearer',
    expires_in: 900,
  }),
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
    expect(result.access_token).toBe('mocked-register-token');
  });

  it('login calls authService.login with input', async () => {
    const input = { email: 'a@b.com', password: 'secret' } as LoginInput;
    await resolver.login(input);
    expect(mockAuthService.login).toHaveBeenCalledWith(input);
  });

  it('login returns access_token', async () => {
    const input = { email: 'a@b.com', password: 'secret' } as LoginInput;
    const result = await resolver.login(input);
    expect(result.access_token).toBe('mocked-login-token');
  });

  it('refresh calls authService.refresh with input', async () => {
    const input = { refreshToken: 'refresh-token-123' };
    await resolver.refresh(input);
    expect(mockAuthService.refresh).toHaveBeenCalledWith(input);
  });

  it('refresh returns tokens', async () => {
    const input = { refreshToken: 'refresh-token-123' };
    const mockTokens = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      token_type: 'Bearer',
      expires_in: 900,
    };
    mockAuthService.refresh.mockResolvedValue(mockTokens);
    const result = await resolver.refresh(input);
    expect(result).toEqual(mockTokens);
  });
});
