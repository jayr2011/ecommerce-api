import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UsersService } from '../users.service';
import { UserOutput } from '../output/user.output';
import { UpdateUserInput } from '../inputs/update-user.input';
import { DeleteUserInput } from '../inputs/delete-user.input';
import { Role } from '@prisma/client';
import { ChangeRoleInput } from '../inputs/change-role.input';

jest.mock('../users.service');

describe('UserResolver', () => {
  let resolver: UserResolver;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UsersService,
          useValue: {
            getUsers: jest.fn(),
            getUserById: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            changeRole: jest.fn(),
            deleteAllUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const mockUsers: UserOutput[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: Role.ADMIN,
          createdAt: new Date(),
        },
      ];
      jest.spyOn(usersService, 'getUsers').mockResolvedValue(mockUsers);

      const result = await resolver.getAllUsers();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const mockUser: UserOutput = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: Role.ADMIN,
        createdAt: new Date(),
      };
      jest.spyOn(usersService, 'getUserById').mockResolvedValue(mockUser);

      const result = await resolver.getUserById('1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update and return the updated user', async () => {
      const mockInput: UpdateUserInput = { name: 'Jane Doe' };
      const mockUser: UserOutput = {
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: Role.USER,
        createdAt: new Date(),
      };
      jest.spyOn(usersService, 'updateUser').mockResolvedValue(mockUser);

      const result = await resolver.updateUser('1', mockInput);
      expect(result).toEqual(mockUser);
    });
  });

  describe('changeRole', () => {
    it('should change the role of a user and return the updated user', async () => {
      const mockInput: ChangeRoleInput = {
        email: 'john@example.com',
        role: Role.ADMIN,
      };
      const mockUser: UserOutput = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: Role.ADMIN,
        createdAt: new Date(),
      };
      jest.spyOn(usersService, 'changeRole').mockResolvedValue(mockUser);

      const result = await resolver.changeRole(mockInput);
      expect(result).toEqual(mockUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return the deleted user', async () => {
      const mockInput: DeleteUserInput = { id: '1' };
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: Role.ADMIN,
        createdAt: new Date(),
      };
      jest.spyOn(usersService, 'deleteUser').mockResolvedValue(mockUser);

      const result = await resolver.deleteUser(mockInput);
      expect(result).toEqual(mockUser);
    });
  });
});
