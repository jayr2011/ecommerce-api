import { Test, TestingModule } from '@nestjs/testing';
import { OrdersResolver } from '../../../src/orders/resolver/orders.resolver';
import { OrdersService } from '../../../src/orders/orders.service';
import { CreateOrderInput } from '../../../src/orders/inputs/create-order.input';

const mockOrdersService = {
  createOrder: jest.fn(),
  getOrderById: jest.fn(),
};

describe('OrdersResolver', () => {
  let resolver: OrdersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersResolver,
        { provide: OrdersService, useValue: mockOrdersService },
      ],
    }).compile();

    resolver = module.get<OrdersResolver>(OrdersResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('create should call ordersService.createOrder and return order', async () => {
    const input: CreateOrderInput = {
      items: [{ qty: 1, unitPrice: 10.0, productId: 'prod-1' }],
    };
    const mockResult = {
      id: 'order-1',
      total: 10.0,
      items: [{ id: 'item-1', variantId: 'v-1', qty: 1, unitPrice: 10.0 }],
      createdAt: new Date(),
    };
    mockOrdersService.createOrder.mockResolvedValue(mockResult);
    const res = await resolver.create(input);
    expect(mockOrdersService.createOrder).toHaveBeenCalledWith(input);
    expect(res).toEqual(mockResult);
  });

  it('getById should call ordersService.getOrderById and return order', async () => {
    const mockResult = {
      id: 'order-1',
      total: 10.0,
      items: [{ id: 'item-1', variantId: 'v-1', qty: 1, unitPrice: 10.0 }],
      createdAt: new Date(),
    };
    mockOrdersService.getOrderById.mockResolvedValue(mockResult);
    const res = await resolver.getById('order-1');
    expect(mockOrdersService.getOrderById).toHaveBeenCalledWith('order-1');
    expect(res).toEqual(mockResult);
  });
});
