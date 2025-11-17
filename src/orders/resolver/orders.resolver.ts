import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { OrdersService } from '../orders.service';
import { CreateOrderInput } from '../inputs/create-order.input';
import { OrderOutput } from '../outputs/order.output';

@Resolver()
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => OrderOutput, { name: 'createOrder' })
  create(@Args('input') input: CreateOrderInput) {
    return this.ordersService.createOrder(input as any);
  }

  @Query(() => OrderOutput, { name: 'orderById', nullable: true })
  getById(@Args('id') id: string) {
    return this.ordersService.getOrderById(id);
  }
}
