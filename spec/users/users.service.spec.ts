import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserUpdateDto } from '../../src/users/dto/*';
import { Role } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: '1',
    name: 'User One',
    email: 'one@example.com',
    role: Role.USER,
    createdAt: new Date(),
  };

  const mockUsers = [mockUser];

  const mockPrisma = {
    user: {
      findMany: jest.fn().mockResolvedValue(mockUsers),
      findUnique: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(mockUser),
      delete: jest.fn().mockResolvedValue(mockUser),
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

  describe('getUsers', () => {
    it('should call prisma.user.findMany', async () => {
      await service.getUsers();
      expect(mockPrisma.user.findMany).toHaveBeenCalled();
    });

    it('should return mapped users', async () => {
      const result = await service.getUsers();
      expect(result).toEqual(mockUsers);
    });

    it('should propagate errors from prisma', async () => {
      mockPrisma.user.findMany.mockRejectedValueOnce(new Error('db-fail'));
      await expect(service.getUsers()).rejects.toThrow('db-fail');
    });
  });

  describe('changeRole', () => {
    it('should call prisma.user.findUnique with correct email', async () => {
      await service.changeRole('one@example.com', Role.ADMIN);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'one@example.com' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(
        service.changeRole('one@example.com', Role.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });

    it('should call prisma.user.update with correct data', async () => {
      await service.changeRole('1', Role.ADMIN);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { role: Role.ADMIN },
      });
    });

    it('should return updated user', async () => {
      const result = await service.changeRole('1', Role.ADMIN);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from prisma', async () => {
      mockPrisma.user.update.mockRejectedValueOnce(new Error('db-fail'));
      await expect(service.changeRole('1', Role.ADMIN)).rejects.toThrow(
        'db-fail',
      );
    });
  });

  describe('getUserById', () => {
    it('should call prisma.user.findUnique with correct id', async () => {
      await service.getUserById('1');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return user when found', async () => {
      const result = await service.getUserById('1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.getUserById('1')).rejects.toThrow(NotFoundException);
    });

    it('should propagate errors from prisma', async () => {
      mockPrisma.user.findUnique.mockRejectedValueOnce(new Error('db-fail'));
      await expect(service.getUserById('1')).rejects.toThrow('db-fail');
    });
  });

  describe('updateUser', () => {
    it('should call prisma.user.findUnique to check existence', async () => {
      const updateDto: UserUpdateDto = { name: 'Updated Name' };
      await service.updateUser('1', updateDto);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      const updateDto: UserUpdateDto = { name: 'Updated Name' };
      await expect(service.updateUser('1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should call prisma.user.update with correct data', async () => {
      const updateDto: UserUpdateDto = {
        name: 'Updated Name',
        email: 'new@example.com',
      };
      await service.updateUser('1', updateDto);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated Name', email: 'new@example.com' },
      });
    });

    it('should return updated user', async () => {
      const updateDto: UserUpdateDto = { name: 'Updated Name' };
      const result = await service.updateUser('1', updateDto);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from prisma', async () => {
      const updateDto: UserUpdateDto = { name: 'Updated Name' };
      mockPrisma.user.update.mockRejectedValueOnce(new Error('db-fail'));
      await expect(service.updateUser('1', updateDto)).rejects.toThrow(
        'db-fail',
      );
    });
  });

  describe('deleteUser', () => {
    it('should call prisma.user.findUnique to check existence', async () => {
      await service.deleteUser('1');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.deleteUser('1')).rejects.toThrow(NotFoundException);
    });

    it('should call prisma.user.delete with correct id', async () => {
      await service.deleteUser('1');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return deleted user', async () => {
      const result = await service.deleteUser('1');
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from prisma', async () => {
      mockPrisma.user.delete.mockRejectedValueOnce(new Error('db-fail'));
      await expect(service.deleteUser('1')).rejects.toThrow('db-fail');
    });
  });
});

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: '1',
    name: 'User One',
    email: 'one@example.com',
    role: Role.USER,
    createdAt: new Date(),
  };

  const mockUsers = [mockUser];

  const mockPrisma = {
    user: {
      findMany: jest.fn().mockResolvedValue(mockUsers),
      findUnique: jest.fn().mockResolvedValue(mockUser),
      update: jest.fn().mockResolvedValue(mockUser),
      delete: jest.fn().mockResolvedValue(mockUser),
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

  describe('getUsers', () => {
    it('should call prisma.user.findMany', async () => {
      await service.getUsers();
      expect(mockPrisma.user.findMany).toHaveBeenCalled();
    });

    it('should return mapped users', async () => {
      const result = await service.getUsers();
      expect(result).toEqual(mockUsers);
    });

    it('should propagate errors from prisma', async () => {
      mockPrisma.user.findMany.mockRejectedValueOnce(new Error('db-fail'));
      await expect(service.getUsers()).rejects.toThrow('db-fail');
    });
  });

  describe('getUserById', () => {
    it('should call prisma.user.findUnique with correct id', async () => {
      await service.getUserById('1');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return user when found', async () => {
      const result = await service.getUserById('1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.getUserById('1')).rejects.toThrow(NotFoundException);
    });

    it('should propagate errors from prisma', async () => {
      mockPrisma.user.findUnique.mockRejectedValueOnce(new Error('db-fail'));
      await expect(service.getUserById('1')).rejects.toThrow('db-fail');
    });
  });

  describe('updateUser', () => {
    it('should call prisma.user.findUnique to check existence', async () => {
      const updateDto: UserUpdateDto = { name: 'Updated Name' };
      await service.updateUser('1', updateDto);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      const updateDto: UserUpdateDto = { name: 'Updated Name' };
      await expect(service.updateUser('1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should call prisma.user.update with correct data', async () => {
      const updateDto: UserUpdateDto = {
        name: 'Updated Name',
        email: 'new@example.com',
      };
      await service.updateUser('1', updateDto);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated Name', email: 'new@example.com' },
      });
    });

    it('should hash password when provided', async () => {
      const updateDto: UserUpdateDto = { password: 'newpassword' };
      await service.updateUser('1', updateDto);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: { passwordHash: expect.any(String) },
      });
    });

    it('should return updated user', async () => {
      const updateDto: UserUpdateDto = { name: 'Updated Name' };
      const result = await service.updateUser('1', updateDto);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from prisma', async () => {
      const updateDto: UserUpdateDto = { name: 'Updated Name' };
      mockPrisma.user.update.mockRejectedValueOnce(new Error('db-fail'));
      await expect(service.updateUser('1', updateDto)).rejects.toThrow(
        'db-fail',
      );
    });
  });

  describe('deleteUser', () => {
    it('should call prisma.user.findUnique to check existence', async () => {
      await service.deleteUser('1');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);
      await expect(service.deleteUser('1')).rejects.toThrow(NotFoundException);
    });

    it('should call prisma.user.delete with correct id', async () => {
      await service.deleteUser('1');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return deleted user', async () => {
      const result = await service.deleteUser('1');
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from prisma', async () => {
      mockPrisma.user.delete.mockRejectedValueOnce(new Error('db-fail'));
      await expect(service.deleteUser('1')).rejects.toThrow('db-fail');
    });
  });
});
