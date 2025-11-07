import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() slug: string;
  @IsInt() @Min(0) priceCents: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsString() categoryId?: string;
}
