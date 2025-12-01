import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CartResolver } from './resolver/cart.resolver';

@Module({
  imports: [PrismaService],
  providers: [CartService, PrismaService, CartResolver],
  controllers: [CartController],
})
export class CartModule {}
