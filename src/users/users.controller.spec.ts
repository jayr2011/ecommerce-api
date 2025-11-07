import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsers = [
    { id: 1, name: 'User One', email: 'one@example.com' },
    { id: 2, name: 'User Two', email: 'two@example.com' },
  ];

  const mockUsersService = {
    getUsers: jest.fn().mockResolvedValue(mockUsers),
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

  it('getUsers calls usersService.getUsers', async () => {
    await controller.getUsers();
    expect(mockUsersService.getUsers).toHaveBeenCalled();
  });

  it('getUsers returns users array', async () => {
    const users = await controller.getUsers();
    expect(users).toEqual(mockUsers);
  });

  it('getUsers propagates errors from service', async () => {
    mockUsersService.getUsers.mockRejectedValueOnce(new Error('fail'));
    await expect(controller.getUsers()).rejects.toThrow('fail');
  });
});
