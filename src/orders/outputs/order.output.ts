import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class OrderItemOutput {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  variantId: string;

  @Field(() => Float)
  qty: number;

  @Field(() => Float)
  unitPrice: number;
}

@ObjectType()
export class OrderOutput {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  userId?: string | null;

  @Field(() => Float)
  total: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  addressJson?: any;

  @Field(() => [OrderItemOutput])
  items: OrderItemOutput[];

  @Field()
  createdAt: Date;
}
