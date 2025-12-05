import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CartResolver } from './resolver/cart.resolver';
import { RedisService } from '../common/redis/redis.service';

@Module({
  imports: [PrismaService, RedisService],
  providers: [CartService, PrismaService, CartResolver],
  controllers: [CartController],
})
export class CartModule {}
