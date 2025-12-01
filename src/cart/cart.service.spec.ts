/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CartService', () => {
  let service: CartService;
  const mockPrisma: any = {
    product: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('addItem -> adds product to cart when product exists', async () => {
    mockPrisma.product.findUnique.mockResolvedValueOnce({
      id: 'p1',
      title: 'Product 1',
      priceCents: 1250,
    });

    const cart = await service.addItem('UserA', 'p1', 2);

    expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: 'p1' },
    });
    expect(cart).toHaveLength(1);
    expect(cart[0]).toMatchObject({
      productId: 'p1',
      quantity: 2,
      title: 'Product 1',
      price: 12.5,
    });
  });

  it('addItem -> increments quantity when item already in cart', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      id: 'p2',
      title: 'Product 2',
      priceCents: 500,
    });

    await service.addItem('UserB', 'p2', 1);
    const cart = await service.addItem('UserB', 'p2', 3);

    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(4);
  });

  it('addItem -> throws NotFoundException when product not found', async () => {
    mockPrisma.product.findUnique.mockResolvedValue(null);
    await expect(service.addItem('UserC', 'nope', 1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('getItems -> returns items previously added', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      id: 'p3',
      title: 'Product 3',
      priceCents: 300,
    });

    await service.addItem('UserD', 'p3', 1);
    const items = service.getItems('UserD');
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe('p3');
  });

  it('removeItem -> removes specific product from cart', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      id: 'p4',
      title: 'Product 4',
      priceCents: 700,
    });

    await service.addItem('UserE', 'p4', 2);
    const after = service.removeItem('UserE', 'p4');
    expect(after).toEqual([]);
    expect(service.getItems('UserE')).toEqual([]);
  });

  it('clearCart -> clears the cart', async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      id: 'p5',
      title: 'Product 5',
      priceCents: 900,
    });

    await service.addItem('UserF', 'p5', 1);
    const cleared = service.clearCart('UserF');
    expect(cleared).toEqual([]);
    expect(service.getItems('UserF')).toEqual([]);
  });
});
