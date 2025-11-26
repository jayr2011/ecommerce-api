import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  ParseUUIDPipe,
  Body,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto, UserUpdateDto } from '../users/dto/*';
import { ChangeRoleDto } from '../users/dto/change-role.dto';
import { Roles } from 'src/auth/decorators/roles.decoretor';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiParam,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({ description: 'List of users', type: UserDto, isArray: true })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @Get('/allUsers')
  async getUsers(): Promise<UserDto[]> {
    return this.usersService.getUsers();
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get a user by id' })
  @ApiParam({ name: 'id', description: "User's UUID" })
  @ApiOkResponse({ description: 'User returned', type: UserDto })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @Get(':id')
  getUserById(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserDto> {
    return this.usersService.getUserById(id);
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'Change a user role' })
  @ApiOkResponse({ description: 'Updated user role', type: UserDto })
  @ApiBody({ type: ChangeRoleDto })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @Patch('/changeRole/:email')
  changeRole(@Body() dto: ChangeRoleDto) {
    return this.usersService.changeRole(dto.email, dto.role);
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: "User's UUID" })
  @ApiOkResponse({ description: 'Updated user', type: UserDto })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiBody({ type: UserUpdateDto })
  @Patch(':id')
  updateUser(@Param('id', new ParseUUIDPipe()) id: string, dto: UserUpdateDto) {
    return this.usersService.updateUser(id, dto);
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiParam({ name: 'id', description: "User's UUID" })
  @ApiOkResponse({ description: 'Deleted user', type: UserDto })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete all users (for tests/coverage only)' })
  @ApiOkResponse({ description: 'Number of deleted users', type: Number })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @Delete('/coverage/deleteAllUsers')
  deleteAllUsers() {
    return this.usersService.deleteAllUsers();
  }
}
