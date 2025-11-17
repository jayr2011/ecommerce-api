import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'c1' })
  id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Electronics' })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'electronics' })
  slug: string;
}

export class ProductVariantDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'v1' })
  id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'sku1' })
  sku: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 10 })
  stock: number;
}

export class ProductDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'f8e4d6a8-4f35-11ee-be56-0242ac120002' })
  id: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'My product title' })
  title: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'The product description', required: false })
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 2999 })
  priceCents: number;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ example: true })
  active: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'c1', required: false })
  categoryId?: string;

  @IsOptional()
  @ApiProperty({ type: CategoryDto, required: false })
  category?: CategoryDto;

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: [ProductVariantDto], required: false })
  variants?: ProductVariantDto[];
}

export class PaginatedProductsDto {
  @IsArray()
  @ApiProperty({ type: [ProductDto] })
  items: ProductDto[];

  @IsNumber()
  @ApiProperty({ example: 10 })
  total: number;

  @IsNumber()
  @ApiProperty({ example: 0 })
  skip: number;

  @IsNumber()
  @ApiProperty({ example: 25 })
  take: number;
}
