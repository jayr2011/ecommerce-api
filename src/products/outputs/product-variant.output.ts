import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class ProductVariantOutput {
  @Field(() => ID)
  id: string;

  @Field()
  sku: string;

  @Field(() => String)
  attrs: string;

  @Field()
  stock: number;
}
