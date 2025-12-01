import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaService],
  providers: [CartService, PrismaService],
  controllers: [CartController],
})
export class CartModule {}
