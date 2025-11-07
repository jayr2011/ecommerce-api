import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ProductVariantOutput {
  @Field(() => ID)
  id: string;

  @Field()
  sku: string;

  @Field(() => String)
  attrs: string; // JSON as string for simplicity

  @Field()
  stock: number;
}
