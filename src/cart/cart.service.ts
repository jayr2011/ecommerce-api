import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartItem } from './types/cartItem.types';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
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
    try {
      await this.redisService.set(key, value, this.CART_TTL);
      this.logger.log('Saved cart for user: ' + userId + ' (key=' + key + ')');
    } catch (error) {
      this.logger.error(
        'Error saving cart for user: ' + userId,
        error as Error,
      );
      throw error;
    }
  }

  async getItems(userId: string): Promise<CartItem[]> {
    const key = this.getKey(userId);
    let data: string | null = null;
    try {
      data = await this.redisService.get(key);
      this.logger.debug(
        'Fetched cart from Redis for user: ' + userId + ' (key=' + key + ')',
      );
    } catch (error) {
      this.logger.error(
        'Error fetching cart for user: ' + userId,
        error as Error,
      );
      return [];
    }

    if (!data) {
      this.logger.debug('No cart data found for user: ' + userId);
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed as CartItem[];
      }
      return [];
    } catch (err) {
      this.logger.error(
        'Error parsing cart JSON for user: ' + userId,
        err as Error,
      );
      return [];
    }
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      this.logger.warn(
        'Product not found when adding to cart: ' +
          productId +
          ' for user ' +
          userId,
      );
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
    this.logger.log(
      'Added/updated item in cart for user: ' +
        userId +
        ' product: ' +
        productId +
        ' qty: ' +
        quantity,
    );
    return cart;
  }

  async removeItem(userId: string, productId: string) {
    const cart = await this.getItems(userId);
    const newCart = cart.filter((item) => item.productId !== productId);
    await this.saveCart(userId, newCart);
    this.logger.log(
      'Removed item from cart for user: ' + userId + ' product: ' + productId,
    );
    return newCart;
  }

  async clearCart(userId: string) {
    const key = this.getKey(userId);
    try {
      await this.redisService.del(key);
      this.logger.log('Cleared cart for user: ' + userId);
    } catch (error) {
      this.logger.error(
        'Error clearing cart for user: ' + userId,
        error as Error,
      );
    }
    return [];
  }
}
