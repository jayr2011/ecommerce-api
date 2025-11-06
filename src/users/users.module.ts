import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserResolver } from './resolver/user.resolver';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, UserResolver],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
