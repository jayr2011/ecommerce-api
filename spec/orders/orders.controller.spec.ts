import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../../src/orders/orders.controller';
import { OrdersService } from '../../src/orders/orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;

  beforeEach(async () => {
    const mockService = {
      createOrder: jest.fn(),
      getOrderById: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: mockService }],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
