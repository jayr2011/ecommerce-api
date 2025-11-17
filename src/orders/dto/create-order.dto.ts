import {
  IsArray,
  IsInt,
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
    description: 'ID do produto',
  })
  productId?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({
    example: '6a3c1b2e-4f35-11ee-be56-0242ac120002',
    description: 'ID da variante do produto',
  })
  variantId?: string;

  @IsInt()
  @Min(1)
  @ApiProperty({ example: 2, description: 'Quantidade do item' })
  qty: number;

  @IsInt()
  @Min(0)
  @ApiProperty({ example: 1999, description: 'Preço unitário em centavos' })
  unitPrice: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty({
    example: 'f8e4d6a8-4f35-11ee-be56-0242ac120002',
    description: 'ID do usuário, opcional',
  })
  userId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsNotEmpty()
  @ApiProperty({ type: [CreateOrderItemDto], description: 'Itens do pedido' })
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsObject()
  @ApiProperty({
    example: { street: 'Rua Exemplo, 123' },
    description: 'Endereço de entrega (JSON)',
    required: false,
  })
  addressJson?: Record<string, any>;
}
