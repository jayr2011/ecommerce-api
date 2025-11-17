import { InputType, Field, Float } from '@nestjs/graphql';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  Min,
} from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';

@InputType()
export class CreateOrderItemInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  variantId?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(1)
  qty: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

@InputType()
export class CreateOrderInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field(() => [CreateOrderItemInput])
  @IsArray()
  @IsNotEmpty()
  items: CreateOrderItemInput[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  @IsOptional()
  addressJson?: Record<string, any>;
}
