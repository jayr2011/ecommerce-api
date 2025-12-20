import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { UserDto, UserUpdateDto } from '../../src/users/dto/*';
import { ChangeRoleDto } from '../../src/users/dto/change-role.dto';
import { Role } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUser: UserDto = {
    id: '1',
    name: 'User One',
    email: 'one@example.com',
    role: 'ADMIN',
    createdAt: new Date(),
  };

  const mockUsers: UserDto[] = [mockUser];

  const mockUsersService = {
    getUsers: jest.fn().mockResolvedValue(mockUsers),
    getUserById: jest.fn().mockResolvedValue(mockUser),
    updateUser: jest.fn().mockResolvedValue(mockUser),
    deleteUser: jest.fn().mockResolvedValue(mockUser),
    changeRole: jest.fn().mockResolvedValue({ ...mockUser, role: 'ADMIN' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should call usersService.getUsers', async () => {
      await controller.getUsers();
      expect(mockUsersService.getUsers).toHaveBeenCalled();
    });

    it('should return users array', async () => {
      const users = await controller.getUsers();
      expect(users).toEqual(mockUsers);
    });

    it('should propagate errors from service', async () => {
      mockUsersService.getUsers.mockRejectedValueOnce(new Error('fail'));
      await expect(controller.getUsers()).rejects.toThrow('fail');
    });
  });

  describe('getUserById', () => {
    it('should call usersService.getUserById with correct id', async () => {
      await controller.getUserById('1');
      expect(mockUsersService.getUserById).toHaveBeenCalledWith('1');
    });

    it('should return user by id', async () => {
      const user = await controller.getUserById('1');
      expect(user).toEqual(mockUser);
    });

    it('should propagate errors from service', async () => {
      mockUsersService.getUserById.mockRejectedValueOnce(new Error('fail'));
      await expect(controller.getUserById('1')).rejects.toThrow('fail');
    });
  });

  describe('updateUser', () => {
    it('should call usersService.updateUser with correct id and dto', async () => {
      const updateDto: UserUpdateDto = { name: 'Updated Name' };
      await controller.updateUser('1', updateDto);
      expect(mockUsersService.updateUser).toHaveBeenCalledWith('1', updateDto);
    });

    it('should return updated user', async () => {
      const updateDto: UserUpdateDto = { name: 'Updated Name' };
      const result = await controller.updateUser('1', updateDto);
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from service', async () => {
      const updateDto: UserUpdateDto = { name: 'Updated Name' };
      mockUsersService.updateUser.mockRejectedValueOnce(new Error('fail'));
      await expect(controller.updateUser('1', updateDto)).rejects.toThrow(
        'fail',
      );
    });
  });

  describe('deleteUser', () => {
    it('should call usersService.deleteUser with correct id', async () => {
      await controller.deleteUser('1');
      expect(mockUsersService.deleteUser).toHaveBeenCalledWith('1');
    });

    it('should return deleted user', async () => {
      const result = await controller.deleteUser('1');
      expect(result).toEqual(mockUser);
    });

    it('should propagate errors from service', async () => {
      mockUsersService.deleteUser.mockRejectedValueOnce(new Error('fail'));
      await expect(controller.deleteUser('1')).rejects.toThrow('fail');
    });
  });
  describe('changeRole', () => {
    it('should delegate role change to UsersService with email and role from DTO', async () => {
      const dto: ChangeRoleDto = { email: 'one@example.com', role: Role.ADMIN };
      const result = await controller.changeRole(dto);
      expect(mockUsersService.changeRole).toHaveBeenCalledWith(
        dto.email,
        dto.role,
      );
      expect(result).toEqual({ ...mockUser, role: 'ADMIN' });
    });
  });
});
