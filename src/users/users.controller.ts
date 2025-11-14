import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto, UserUpdateDto } from '../users/dto/*';
import { Roles } from 'src/auth/decorators/roles.decoretor';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('ADMIN')
  @Get('/allUsers')
  async getUsers(): Promise<UserDto[]> {
    return this.usersService.getUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  getUserById(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserDto> {
    return this.usersService.getUserById(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  updateUser(@Param('id', new ParseUUIDPipe()) id: string, dto: UserUpdateDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Roles('ADMIN')
  @Delete('/coverage/deleteAllUsers')
  deleteAllUsers() {
    return this.usersService.deleteAllUsers();
  }
}
