import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsers = [
    {
      id: 1,
      name: 'User One',
      email: 'one@example.com',
      role: 'USER',
      createdAt: new Date(),
    },
    {
      id: 2,
      name: 'User Two',
      email: 'two@example.com',
      role: 'ADMIN',
      createdAt: new Date(),
    },
  ];

  const mockPrisma = {
    user: {
      findMany: jest.fn().mockResolvedValue(mockUsers),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getUsers calls prisma.user.findMany', async () => {
    await service.getUsers();
    expect(mockPrisma.user.findMany).toHaveBeenCalled();
  });

  it('getUsers returns mapped users', async () => {
    const result = await service.getUsers();
    expect(result).toEqual(
      mockUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
    );
  });

  it('getUsers propagates errors from prisma', async () => {
    mockPrisma.user.findMany.mockRejectedValueOnce(new Error('db-fail'));
    await expect(service.getUsers()).rejects.toThrow('db-fail');
  });
});
