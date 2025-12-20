/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from '../../src/cart/cart.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { RedisService } from '../../src/common/redis/redis.service';

describe('CartService', () => {
  let service: CartService;
  const mockPrisma: any = {
    product: {
      findUnique: jest.fn(),
    },
  };
  const mockRedis: any = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    // Silenciar logs durante os testes
    jest.spyOn(service['logger'], 'error').mockImplementation();
    jest.spyOn(service['logger'], 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getItems', () => {
    it('returns empty array when Redis returns null', async () => {
      mockRedis.get.mockResolvedValue(null);
      const items = await service.getItems('user1');
      expect(items).toEqual([]);
    });

    it('returns empty array when Redis returns empty string', async () => {
      mockRedis.get.mockResolvedValue('');
      const items = await service.getItems('user2');
      expect(items).toEqual([]);
    });

    it('returns empty array when JSON.parse fails', async () => {
      mockRedis.get.mockResolvedValue('invalid-json{');
      const items = await service.getItems('user3');
      expect(items).toEqual([]);
    });

    it('returns empty array when parsed JSON is not an array', async () => {
      mockRedis.get.mockResolvedValue('{"notAnArray": true}');
      const items = await service.getItems('user4');
      expect(items).toEqual([]);
    });

    it('returns valid items when parse succeeds', async () => {
      const cartData = [
        { productId: 'p1', quantity: 2, title: 'Prod 1', price: 10.5 },
      ];
      mockRedis.get.mockResolvedValue(JSON.stringify(cartData));
      const items = await service.getItems('user5');
      expect(items).toEqual(cartData);
    });
  });

  describe('addItem', () => {
    it('throws NotFoundException when product does not exist', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.addItem('user2', 'nope', 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('adds product to cart and persists to Redis', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'p1',
        title: 'Product 1',
        priceCents: 1250,
      });

      const cart = await service.addItem('user3', 'p1', 2);

      expect(cart).toHaveLength(1);
      expect(cart[0]).toMatchObject({
        productId: 'p1',
        quantity: 2,
        title: 'Product 1',
        price: 12.5,
      });
      expect(mockRedis.set).toHaveBeenCalledWith(
        'cart:user3',
        JSON.stringify(cart),
        24 * 60 * 50,
      );
    });

    it('increments quantity when item already exists in cart', async () => {
      const existingCart = [
        { productId: 'p2', quantity: 1, title: 'Product 2', price: 5.0 },
      ];
      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));
      mockPrisma.product.findUnique.mockResolvedValue({
        id: 'p2',
        title: 'Product 2',
        priceCents: 500,
      });

      const cart = await service.addItem('user4', 'p2', 3);

      expect(cart).toHaveLength(1);
      expect(cart[0].quantity).toBe(4);
      expect(mockRedis.set).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('removes specific product and persists to Redis', async () => {
      const existingCart = [
        { productId: 'p1', quantity: 2, title: 'Prod 1', price: 10.0 },
        { productId: 'p2', quantity: 1, title: 'Prod 2', price: 5.0 },
      ];
      mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));

      const cart = await service.removeItem('user5', 'p1');

      expect(cart).toHaveLength(1);
      expect(cart[0].productId).toBe('p2');
      expect(mockRedis.set).toHaveBeenCalled();
    });
  });

  describe('clearCart', () => {
    it('removes Redis key', async () => {
      const result = await service.clearCart('user6');

      expect(result).toEqual([]);
      expect(mockRedis.del).toHaveBeenCalledWith('cart:user6');
    });
  });

  it('addItem -> adds product to cart when product exists', async () => {
    mockRedis.get.mockResolvedValue(null);
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
    mockRedis.get.mockResolvedValue(null);
    mockPrisma.product.findUnique.mockResolvedValue({
      id: 'p2',
      title: 'Product 2',
      priceCents: 500,
    });

    await service.addItem('UserB', 'p2', 1);

    const existingCart = [
      { productId: 'p2', quantity: 1, title: 'Product 2', price: 5.0 },
    ];
    mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));

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
    const cartData = [
      { productId: 'p3', quantity: 1, title: 'Product 3', price: 3.0 },
    ];
    mockRedis.get.mockResolvedValue(JSON.stringify(cartData));

    const items = await service.getItems('UserD');
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBe('p3');
  });

  it('removeItem -> removes specific product from cart', async () => {
    const existingCart = [
      { productId: 'p4', quantity: 2, title: 'Product 4', price: 7.0 },
    ];
    mockRedis.get.mockResolvedValue(JSON.stringify(existingCart));

    const after = await service.removeItem('UserE', 'p4');
    expect(after).toEqual([]);
  });

  it('clearCart -> clears the cart', async () => {
    const cleared = await service.clearCart('UserF');
    expect(cleared).toEqual([]);
    expect(mockRedis.del).toHaveBeenCalledWith('cart:userf');
  });
});
