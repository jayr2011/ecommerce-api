import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/created-product.dto';
import { Roles } from 'src/auth/decorators/roles.decoretor';
import { ProductSort } from './dto/list-product.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  list(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('sort') sort?: ProductSort,
    @Query('min') min?: number,
    @Query('max') max?: number,
  ) {
    return this.productsService.list({
      q,
      category,
      skip: Number(skip) || 0,
      take: Number(take),
      sort: sort,
      min: min,
      max: max,
    });
  }

  @Public()
  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.productsService.bySlug(slug);
  }

  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.productsService.update(id, dto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
