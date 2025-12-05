import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartItem } from './types/cartItem.types';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class CartService {
  private readonly CART_TTL = 24 * 60 * 50;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  private getKey(userId: string) {
    return `cart:${userId.toLowerCase()}`;
  }

  private async saveCart(userId: string, cart: CartItem[]) {
    const key = this.getKey(userId);
    const value = JSON.stringify(cart);
    await this.redisService.set(key, value, this.CART_TTL);
  }

  async getItems(userId: string): Promise<CartItem[]> {
    const key = this.getKey(userId);
    const data = await this.redisService.get(key);

    if (!data) return [];

    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const cart = await this.getItems(userId);

    const existingItem = cart.find((item) => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId,
        quantity,
        title: product.title,
        price: Number((product.priceCents / 100).toFixed(2)),
      });
    }
    await this.saveCart(userId, cart);
    return cart;
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getItems(userId);
    const newCart = cart.filter((item) => item.productId !== productId);
    await this.saveCart(userId, newCart);
    return newCart;
  }

  async clearCart(userId: string) {
    const key = this.getKey(userId);
    await this.redisService.del(key);
    return [];
  }
}
