/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/addCartItem.dto';
import { NotFoundException } from '@nestjs/common';
import { RequestWithUser } from 'src/types/auth.types';

describe('CartController', () => {
  let controller: CartController;
  let cartService: Partial<Record<keyof CartService, jest.Mock>>;

  const mockCart = [
    { productId: 'p1', quantity: 1, title: 'Product 1', price: 10 },
  ];

  beforeEach(async () => {
    cartService = {
      addItem: jest.fn().mockResolvedValue(mockCart),
      getItems: jest.fn().mockReturnValue(mockCart),
      removeItem: jest.fn().mockReturnValue(mockCart),
      clearCart: jest.fn().mockReturnValue([]),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: cartService }],
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addItem', () => {
    it('calls CartService.addItem with qty provided and returns cart', async () => {
      const req = { user: { sub: 'user-1' } } as RequestWithUser;
      const dto: AddCartItemDto = { productId: 'p1', quantity: 2 };

      await expect(controller.addItem(req, dto)).resolves.toEqual(mockCart);
      expect(cartService.addItem).toHaveBeenCalledWith('user-1', 'p1', 2);
    });

    it('defaults quantity to 1 when not provided', async () => {
      const req = { user: { sub: 'user-2' } } as RequestWithUser;
      const dto: Partial<AddCartItemDto> = { productId: 'p1' };

      await expect(
        controller.addItem(req, dto as AddCartItemDto),
      ).resolves.toEqual(mockCart);
      expect(cartService.addItem).toHaveBeenCalledWith('user-2', 'p1', 1);
    });

    it('throws NotFoundException when user is missing', () => {
      const req = {} as RequestWithUser;
      const dto: AddCartItemDto = {
        productId: 'p1',
        quantity: 0,
      };

      expect(() => controller.addItem(req, dto)).toThrow(NotFoundException);
      expect(cartService.addItem).not.toHaveBeenCalled();
    });
  });

  describe('getItems', () => {
    it('returns items for authenticated user', () => {
      const req = { user: { sub: 'user-3' } } as RequestWithUser;
      expect(controller.getItems(req)).toEqual(mockCart);
      expect(cartService.getItems).toHaveBeenCalledWith('user-3');
    });

    it('throws NotFoundException when user missing', () => {
      const req = {} as RequestWithUser;
      expect(() => controller.getItems(req)).toThrow(NotFoundException);
    });
  });

  describe('removeItem', () => {
    it('calls removeItem with productId and userId', () => {
      const req = { user: { sub: 'user-4' } } as RequestWithUser;
      const productId = '7f9c3b90-1b2a-4d3f-8e2a-123456789abc';

      expect(controller.removeItem(req, productId)).toEqual(mockCart);
      expect(cartService.removeItem).toHaveBeenCalledWith('user-4', productId);
    });

    it('throws NotFoundException when user missing', () => {
      const req = {} as RequestWithUser;
      const productId = '7f9c3b90-1b2a-4d3f-8e2a-123456789abc';
      expect(() => controller.removeItem(req, productId)).toThrow(
        NotFoundException,
      );
    });
  });

  describe('clearCart', () => {
    it('clears cart for authenticated user', () => {
      const req = { user: { sub: 'user-5' } } as RequestWithUser;
      expect(controller.clearCart(req)).toEqual([]);
      expect(cartService.clearCart).toHaveBeenCalledWith('user-5');
    });

    it('throws NotFoundException when user missing', () => {
      const req = {} as RequestWithUser;
      expect(() => controller.clearCart(req)).toThrow(NotFoundException);
    });
  });
});
