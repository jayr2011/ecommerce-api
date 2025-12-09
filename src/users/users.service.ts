import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto, UserUpdateDto } from '../users/dto/*';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly prisma: PrismaService) {}

  private mapUserToDto(user: User): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  private async findUserByIdOrThrow(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`user with id ${id} not found`);
    }
    return user;
  }

  async getUsers(): Promise<UserDto[]> {
    this.logger.log('getUsers() called');
    const users = await this.prisma.user.findMany();
    if (!users || users.length === 0) {
      this.logger.warn('getUsers() returned no users');
      throw new NotFoundException('No users found');
    }
    return users.map((user) => this.mapUserToDto(user));
  }

  async getUserById(id: string): Promise<UserDto> {
    this.logger.log('getUserById() called — id=' + id);
    const user = await this.findUserByIdOrThrow(id);
    this.logger.log('getUserById() found user — id=' + id);
    return this.mapUserToDto(user);
  }

  async changeRole(email: string, role: Role): Promise<UserDto> {
    this.logger.log('changeRole() called — email=' + email + ' role=' + role);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      this.logger.warn('changeRole() user not found — email=' + email);
      throw new NotFoundException(`user with email ${email} not found`);
    }
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { role },
    });
    this.logger.log(
      'changeRole() success — id=' + updated.id + ' role=' + updated.role,
    );
    return this.mapUserToDto(updated);
  }

  async updateUser(id: string, dto: UserUpdateDto): Promise<UserDto> {
    this.logger.log('updateUser() called — id=' + id);
    await this.findUserByIdOrThrow(id);

    const { name, email, password, role } = dto;
    const data: Prisma.UserUpdateInput = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (role) data.role = role;
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });
    this.logger.log('updateUser() success — id=' + updated.id);
    return this.mapUserToDto(updated);
  }

  async deleteUser(id: string): Promise<UserDto> {
    this.logger.log('deleteUser() called — id=' + id);
    await this.findUserByIdOrThrow(id);

    const deleted = await this.prisma.user.delete({ where: { id } });
    this.logger.log('deleteUser() success — id=' + deleted.id);
    return this.mapUserToDto(deleted);
  }

  async deleteAllUsers(): Promise<number> {
    this.logger.log('deleteAllUsers() called');
    const result = await this.prisma.user.deleteMany({});
    this.logger.log('deleteAllUsers() removed ' + result.count + ' users');
    return result.count;
  }
}
