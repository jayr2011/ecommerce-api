import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'My product title' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'my-product-title' })
  slug: string;

  @IsInt()
  @Min(0)
  @ApiProperty({ example: 2999, description: 'Preço em centavos' })
  priceCents: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Uma descrição opcional', required: false })
  description?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ example: true, required: false })
  active?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'c1', required: false })
  categoryId?: string;
}
