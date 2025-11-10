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
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('/allUsers')
  async getUsers(): Promise<UserDto[]> {
    return this.usersService.getUsers();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  getUserById(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserDto> {
    return this.usersService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  updateUser(@Param('id', new ParseUUIDPipe()) id: string, dto: UserUpdateDto) {
    return this.usersService.updateUser(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
