import {
  IsBoolean,
  IsNumber,
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

  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 29.99, description: 'Price in BRL' })
  price: number;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'An optional English description', required: false })
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
