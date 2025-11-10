import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from '../users.service';
import { UserOutput } from '../output/user.output';
import { UpdateUserInput } from '../inputs/update-user.input';
import { DeleteUserInput } from '../inputs/delete-user.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decoretor';

@Resolver()
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Query(() => UserOutput, { name: 'userById' })
  async getUserById(@Args('id') id: string): Promise<UserOutput> {
    return this.usersService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Mutation(() => UserOutput, { name: 'updateUser' })
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<UserOutput> {
    return this.usersService.updateUser(id, input);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Mutation(() => UserOutput, { name: 'deleteUser' })
  async deleteUser(@Args('input') input: DeleteUserInput): Promise<UserOutput> {
    return this.usersService.deleteUser(input.id);
  }
}
