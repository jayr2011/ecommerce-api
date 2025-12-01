import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class CartItemOutput {
  @Field()
  productId: string;

  @Field(() => Int)
  quantity: number;

  @Field({ nullable: true })
  title?: string;

  @Field(() => Float, { nullable: true })
  price?: number;
}
