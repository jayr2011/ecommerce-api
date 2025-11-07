import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductSort {
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
}

export class ListProductsQuery {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() category?: string; // slug da categoria
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) min?: number; // em cents
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) max?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) skip?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) take?: number = 20;
  @IsOptional() @IsEnum(ProductSort) sort?: ProductSort = ProductSort.TITLE_ASC;
}
