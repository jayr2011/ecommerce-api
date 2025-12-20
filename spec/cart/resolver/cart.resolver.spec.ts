import { CartResolver } from '../../../src/cart/resolver/cart.resolver';
import { CartService } from '../../../src/cart/cart.service';
import { AddCartItemInput } from '../../../src/cart/inputs/add-cart-item.input';
import { CartItem, GqlContext } from '../../../src/cart/types/cartItem.types';
import { RequestWithUser } from '../../../src/types/auth.types';

describe('CartResolver', () => {
  let resolver: CartResolver;
  let cartService: Partial<Record<keyof CartService, jest.Mock>> & {
    addItem: jest.Mock;
    getItems: jest.Mock;
    removeItem: jest.Mock;
    clearCart: jest.Mock;
  };

  const userReq: GqlContext = {
    req: { user: { sub: 'user-1' } } as RequestWithUser,
  };

  beforeEach(() => {
    cartService = {
      addItem: jest.fn(),
      getItems: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
    };

    resolver = new CartResolver(cartService as unknown as CartService);
  });

  it('calls CartService.addItem and returns cart', async () => {
    const mockCart: CartItem[] = [
      { productId: 'p1', quantity: 2, title: 'T1', price: 10 },
    ];

    cartService.addItem.mockResolvedValue(mockCart);

    const input: AddCartItemInput = { productId: 'p1', quantity: 2 };

    await expect(resolver.addCartItem(input, userReq)).resolves.toEqual(
      mockCart,
    );

    expect(cartService.addItem).toHaveBeenCalledWith('user-1', 'p1', 2);
  });

  it('defaults quantity to 1 when not provided', async () => {
    const mockCart: CartItem[] = [
      { productId: 'p1', quantity: 1, title: 'T1', price: 10 },
    ];

    cartService.addItem.mockResolvedValue(mockCart);

    const input: AddCartItemInput = { productId: 'p1' } as AddCartItemInput;

    await expect(resolver.addCartItem(input, userReq)).resolves.toEqual(
      mockCart,
    );

    expect(cartService.addItem).toHaveBeenCalledWith('user-1', 'p1', 1);
  });

  it('throws when user is missing on addCartItem', async () => {
    const badCtx: GqlContext = { req: {} as RequestWithUser };
    const input: AddCartItemInput = { productId: 'p1', quantity: 1 };

    await expect(resolver.addCartItem(input, badCtx)).rejects.toThrow(
      'User not found',
    );

    expect(cartService.addItem).not.toHaveBeenCalled();
  });

  it('returns items from getCartItems', async () => {
    const mockCart: CartItem[] = [
      { productId: 'p1', quantity: 3, title: 'T1', price: 10 },
    ];
    cartService.getItems.mockResolvedValue(mockCart);

    await expect(resolver.getCartItems(userReq)).resolves.toEqual(mockCart);
    expect(cartService.getItems).toHaveBeenCalledWith('user-1');
  });

  it('throws when user missing on getCartItems', async () => {
    const badCtx2: GqlContext = { req: {} as RequestWithUser };
    await expect(resolver.getCartItems(badCtx2)).rejects.toThrow(
      'User not found',
    );
  });

  it('removeCartItem calls service and returns result', async () => {
    const mockCart: CartItem[] = [];
    cartService.removeItem.mockResolvedValue(mockCart);

    await expect(resolver.removeCartItem('p1', userReq)).resolves.toEqual(
      mockCart,
    );
    expect(cartService.removeItem).toHaveBeenCalledWith('user-1', 'p1');
  });

  it('clearCart calls service and returns result', async () => {
    const mockCart: CartItem[] = [];
    cartService.clearCart.mockResolvedValue(mockCart);

    await expect(resolver.clearCart(userReq)).resolves.toEqual(mockCart);
    expect(cartService.clearCart).toHaveBeenCalledWith('user-1');
  });
});
