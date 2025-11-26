import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Role, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto, UserUpdateDto } from '../users/dto/*';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
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
    const users = await this.prisma.user.findMany();
    if (!users) {
      throw new NotFoundException('No users found');
    }
    return users.map((user) => this.mapUserToDto(user));
  }

  async getUserById(id: string): Promise<UserDto> {
    const user = await this.findUserByIdOrThrow(id);
    return this.mapUserToDto(user);
  }

  async changeRole(email: string, role: Role): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException(`user with email ${email} not found`);
    }
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { role },
    });

    return this.mapUserToDto(updated);
  }

  async updateUser(id: string, dto: UserUpdateDto): Promise<UserDto> {
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
    return this.mapUserToDto(updated);
  }

  async deleteUser(id: string): Promise<UserDto> {
    await this.findUserByIdOrThrow(id);

    const deleted = await this.prisma.user.delete({ where: { id } });
    return this.mapUserToDto(deleted);
  }

  async deleteAllUsers(): Promise<number> {
    const result = await this.prisma.user.deleteMany({});
    return result.count;
  }
}
