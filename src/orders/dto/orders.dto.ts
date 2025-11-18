import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ example: '6a3c1b2e-4f35-11ee-be56-0242ac120002' })
  id: string;

  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({
    example: '6a3c1b2e-4f35-11ee-be56-0242ac120002',
    description: 'Variant ID',
  })
  variantId: string;

  @IsNumber()
  @ApiProperty({ example: 2 })
  qty: number;

  @IsNumber()
  @ApiProperty({ example: 19.99, description: 'Unit price in BRL' })
  unitPrice: number;
}

export class OrderDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ example: 'f8e4d6a8-4f35-11ee-be56-0242ac120002' })
  id: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    example: 'f8e4d6a8-4f35-11ee-be56-0242ac120002',
    required: false,
  })
  userId?: string | null;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 59.99 })
  total: number;

  @IsOptional()
  @ApiProperty({ example: { street: 'Example Street', city: 'São Paulo' } })
  addressJson?: any;

  @IsArray()
  @ApiProperty({ type: [OrderItemDto] })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: '2025-11-11T12:00:00.000Z' })
  @Type(() => Date)
  createdAt: Date;
}

export class PaginatedOrdersDto {
  @IsArray()
  @ApiProperty({ type: [OrderDto] })
  items: OrderDto[];

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
