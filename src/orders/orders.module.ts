import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProductsModule } from '../products/products.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrdersResolver } from './resolver/orders.resolver';

@Module({
  imports: [ProductsModule],
  providers: [OrdersService, PrismaService, OrdersResolver],
  controllers: [OrdersController],
})
export class OrdersModule {}
