import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  slug: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  priceCents: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
