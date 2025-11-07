import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './created-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
