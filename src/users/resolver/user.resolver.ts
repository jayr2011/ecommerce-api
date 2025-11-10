import { Resolver, Query } from '@nestjs/graphql';
import { UsersService } from '../users.service';
import { UserOutput } from '../output/user.output';

@Resolver()
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserOutput], { name: 'allUsers' })
  async getAllUsers(): Promise<UserOutput[]> {
    const users = await this.usersService.getUsers();
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }));
  }
}
