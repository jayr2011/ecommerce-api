import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum ProductSort {
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
}

export class ListProductsQuery {
  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example: 'search term',
    description: 'Search query applied to title and description',
  })
  q?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    example: 'electronics',
    description: 'Category slug filter',
  })
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiProperty({
    required: false,
    example: 5.0,
    description: 'Minimum price in BRL',
  })
  min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @ApiProperty({
    required: false,
    example: 15.0,
    description: 'Maximum price in BRL',
  })
  max?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @ApiProperty({
    required: false,
    example: 0,
    description: 'Number of items to skip (pagination)',
  })
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    required: false,
    example: 20,
    description: 'Number of items to return (pagination)',
  })
  take?: number = 20;

  @IsOptional()
  @IsEnum(ProductSort)
  @ApiProperty({
    required: false,
    enum: ProductSort,
    example: ProductSort.TITLE_ASC,
  })
  sort?: ProductSort = ProductSort.TITLE_ASC;
}
