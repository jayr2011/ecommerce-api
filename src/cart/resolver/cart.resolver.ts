import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards, NotFoundException } from '@nestjs/common';
import { CartService } from '../cart.service';
import { AddCartItemInput } from '../inputs/add-cart-item.input';
import { CartItemOutput } from '../outputs/cart-item.output';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { GqlContext } from '../types/cartItem.types';

@Resolver(() => CartItemOutput)
@UseGuards(JwtAuthGuard)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Mutation(() => [CartItemOutput], { name: 'addCartItem' })
  async addCartItem(
    @Args('input') input: AddCartItemInput,
    @Context() ctx: GqlContext,
  ): Promise<CartItemOutput[]> {
    const userId = ctx.req.user?.sub;
    if (!userId) throw new NotFoundException('User not found');
    return await this.cartService.addItem(
      userId,
      input.productId,
      input.quantity ?? 1,
    );
  }

  @Query(() => [CartItemOutput], { name: 'cartItems' })
  getCartItems(@Context() ctx: GqlContext): CartItemOutput[] {
    const userId = ctx.req.user?.sub;
    if (!userId) throw new NotFoundException('User not found');
    return this.cartService.getItems(userId);
  }

  @Mutation(() => [CartItemOutput], { name: 'removeCartItem' })
  removeCartItem(
    @Args('productId') productId: string,
    @Context() ctx: GqlContext,
  ): CartItemOutput[] {
    const userId = ctx.req.user?.sub;
    if (!userId) throw new NotFoundException('User not found');
    return this.cartService.removeItem(userId, productId);
  }

  @Mutation(() => [CartItemOutput], { name: 'clearCart' })
  clearCart(@Context() ctx: GqlContext): CartItemOutput[] {
    const userId = ctx.req.user?.sub;
    if (!userId) throw new NotFoundException('User not found');
    return this.cartService.clearCart(userId);
  }
}
