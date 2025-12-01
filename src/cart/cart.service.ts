import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartItem } from './types/cartItem.types';

@Injectable()
export class CartService {
  private carts = new Map<string, CartItem[]>();

  constructor(private readonly prisma: PrismaService) {}

  private normalizeKey(userId: string) {
    return userId.toLocaleLowerCase();
  }

  private ensureCart(userId: string) {
    const key = this.normalizeKey(userId);
    if (!this.carts.has(key)) this.carts.set(key, []);
    return this.carts.get(key)!;
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const cart = this.ensureCart(userId);
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

    return cart;
  }

  getItems(userId: string): CartItem[] {
    const key = this.normalizeKey(userId);
    return this.carts.get(key) ?? [];
  }

  removeItem(userId: string, productId: string) {
    const key = this.normalizeKey(userId);
    const cart = this.carts.get(key) ?? [];
    const newCart = cart.filter((item) => item.productId !== productId);
    this.carts.set(key, newCart);
    return newCart;
  }

  clearCart(userId: string) {
    const key = this.normalizeKey(userId);
    this.carts.delete(key);
    return [];
  }
}
