import { Controller, Body, Post, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto } from './dto/orders.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiCreatedResponse({
    description: 'The order has been created.',
    type: OrderDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input',
    type: ErrorResponseDto,
  })
  @ApiBody({ type: CreateOrderDto })
  createOrder(@Body() dto: CreateOrderDto): Promise<OrderDto> {
    return this.ordersService.createOrder(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id' })
  @ApiParam({ name: 'id', description: "Order's UUID" })
  @ApiOkResponse({ type: OrderDto })
  @ApiNotFoundResponse({
    description: 'Order not found',
    type: ErrorResponseDto,
  })
  getOrderById(@Param('id') id: string): Promise<OrderDto> {
    return this.ordersService.getOrderById(id);
  }
}
