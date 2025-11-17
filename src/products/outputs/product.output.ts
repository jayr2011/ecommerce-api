import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { CategoryOutput } from './category.output';
import { ProductVariantOutput } from './product-variant.output';

@ObjectType()
export class ProductOutput {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  slug: string;

  @Field(() => Float)
  price: number;

  @Field({ nullable: true })
  description?: string;

  @Field()
  active: boolean;

  @Field(() => CategoryOutput, { nullable: true })
  category?: CategoryOutput;

  @Field(() => [ProductVariantOutput], { nullable: true })
  variants?: ProductVariantOutput[];
}
