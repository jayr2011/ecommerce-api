import {
  IsArray,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty({
    example: '6a3c1b2e-4f35-11ee-be56-0242ac120002',
    description: 'Product ID',
  })
  productId?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    example: '6a3c1b2e-4f35-11ee-be56-0242ac120002',
    description: 'Product variant ID',
  })
  variantId?: string;

  @IsNumber()
  @Min(1)
  @ApiProperty({ example: 2, description: 'Item quantity' })
  qty: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 19.99, description: 'Unit price in BRL' })
  unitPrice: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty({
    example: 'f8e4d6a8-4f35-11ee-be56-0242ac120002',
    description: 'User ID (optional)',
  })
  userId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsNotEmpty()
  @ApiProperty({ type: [CreateOrderItemDto], description: 'Order items' })
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: { street: 'Example Street, 123' },
    description: 'Delivery address (JSON)',
    required: false,
  })
  addressJson?: Record<string, any>;
}
