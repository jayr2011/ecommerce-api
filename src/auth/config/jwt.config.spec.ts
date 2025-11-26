import { getJwtSecret } from './jwt.config';

describe('getJwtSecret', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return the JWT secret when defined', () => {
    process.env.JWT_SECRET = 'test-secret';
    expect(getJwtSecret()).toBe('test-secret');
  });

  it('should throw an error when JWT_SECRET is not defined', () => {
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow(
      'JWT_SECRET environment variable is not defined',
    );
  });
});
