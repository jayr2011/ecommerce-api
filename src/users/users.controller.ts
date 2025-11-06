import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from '../users/dto/*';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get('/allUsers')
  async getUsers(): Promise<UserDto[]> {
    return this.usersService.getUsers();
  }
}
