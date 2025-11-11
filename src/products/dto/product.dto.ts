import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';

export class ProductDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  priceCents: number;

  @IsNotEmpty()
  @IsBoolean()
  active: boolean;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  category?: CategoryDto;

  @IsOptional()
  @IsArray()
  variants?: ProductVariantDto[];
}

export class CategoryDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  slug: string;
}

export class ProductVariantDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsNumber()
  stock: number;
}

export class PaginatedProductsDto {
  @IsArray()
  items: ProductDto[];

  @IsNumber()
  total: number;

  @IsNumber()
  skip: number;

  @IsNumber()
  take: number;
}
