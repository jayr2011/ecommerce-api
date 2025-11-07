import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({ hash: jest.fn(), compare: jest.fn() }));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let jwt: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = { user: { findUnique: jest.fn(), create: jest.fn() } };
    jwt = { sign: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('register should call prisma.user.findUnique', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      role: 'USER',
    });
    (bcrypt.hash as unknown as jest.Mock).mockResolvedValue('hashed');
    jwt.sign.mockReturnValue('token');
    await service.register({
      name: 'A',
      email: 'a@b.com',
      password: 'pass',
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'a@b.com' },
    });
  });

  it('register should throw if user exists', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      passwordHash: 'x',
      role: 'USER',
    });
    await expect(
      service.register({
        name: 'A',
        email: 'a@b.com',
        password: 'pass',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('register should call bcrypt.hash', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      role: 'USER',
    });
    const hashMock = bcrypt.hash as jest.Mock;
    hashMock.mockResolvedValue('hashed');
    jwt.sign.mockReturnValue('token');
    await service.register({
      name: 'A',
      email: 'a@b.com',
      password: 'pass',
    });
    expect(hashMock).toHaveBeenCalledWith('pass', 10);
  });

  it('register should create user with role USER', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      role: 'USER',
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    jwt.sign.mockReturnValue('token');
    await service.register({
      name: 'A',
      email: 'a@b.com',
      password: 'pass',
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'A',
        email: 'a@b.com',
        passwordHash: 'hashed',
        role: 'USER',
      },
    });
  });

  it('register should return access_token key', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      role: 'USER',
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    jwt.sign.mockReturnValue('token');
    const result = await service.register({
      name: 'A',
      email: 'a@b.com',
      password: 'pass',
    });
    expect(result).toHaveProperty('access_token');
  });

  it('register should return token from jwt.sign', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      role: 'USER',
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    jwt.sign.mockReturnValue('tokenXYZ');
    const result = await service.register({
      name: 'A',
      email: 'a@b.com',
      password: 'pass',
    });
    expect(result.access_token).toBe('tokenXYZ');
  });

  it('login should call prisma.user.findUnique', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      passwordHash: 'hashed',
      role: 'USER',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwt.sign.mockReturnValue('token');
    await service.login({ email: 'a@b.com', password: 'pass' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'a@b.com' },
    });
  });

  it('login should throw if user not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(
      service.login({ email: 'a@b.com', password: 'pass' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login should throw if password mismatch', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      passwordHash: 'hashed',
      role: 'USER',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(
      service.login({ email: 'a@b.com', password: 'pass' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login should call bcrypt.compare', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      passwordHash: 'hashed',
      role: 'USER',
    });
    const compareMock = bcrypt.compare as jest.Mock;
    compareMock.mockResolvedValue(true);
    jwt.sign.mockReturnValue('token');
    await service.login({ email: 'a@b.com', password: 'pass' });
    expect(compareMock).toHaveBeenCalledWith('pass', 'hashed');
  });

  it('login should return access_token key', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      passwordHash: 'hashed',
      role: 'USER',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwt.sign.mockReturnValue('token');
    const result = await service.login({
      email: 'a@b.com',
      password: 'pass',
    });
    expect(result).toHaveProperty('access_token');
  });

  it('login should return token from jwt.sign', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      passwordHash: 'hashed',
      role: 'USER',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwt.sign.mockReturnValue('loginToken');
    const result = await service.login({
      email: 'a@b.com',
      password: 'pass',
    });
    expect(result.access_token).toBe('loginToken');
  });

  it('jwt.sign should be called with correct payload on login', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 2,
      email: 'x@y.com',
      passwordHash: 'hashed',
      role: 'ADMIN',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwt.sign.mockReturnValue('t');
    await service.login({ email: 'x@y.com', password: 'pass' });
    expect(jwt.sign).toHaveBeenCalledWith(
      { sub: 2, email: 'x@y.com', role: 'ADMIN' },
      { expiresIn: '1d' },
    );
  });

  it('jwt.sign should be called with correct payload on register', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 3,
      email: 'new@user.com',
      role: 'USER',
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    jwt.sign.mockReturnValue('t');
    await service.register({
      name: 'New',
      email: 'new@user.com',
      password: 'pass',
    });
    expect(jwt.sign).toHaveBeenCalledWith(
      { sub: 3, email: 'new@user.com', role: 'USER' },
      { expiresIn: '1d' },
    );
  });
});
