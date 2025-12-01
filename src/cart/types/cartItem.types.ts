import { RequestWithUser } from 'src/types/auth.types';

export interface CartItem {
  productId: string;
  quantity: number;
  title?: string;
  price?: number;
}

export type GqlContext = { req: RequestWithUser };
