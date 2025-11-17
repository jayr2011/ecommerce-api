import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const mockPrisma = {
      productVariant: { findFirst: jest.fn().mockResolvedValue({ id: 'v1' }) },
      order: { create: jest.fn().mockResolvedValue({ id: 'o1', totalCents: 1999, items: [] }), findUnique: jest.fn().mockResolvedValue({ id: 'o1', totalCents: 1999, items: [] }) },
    } as any;
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
