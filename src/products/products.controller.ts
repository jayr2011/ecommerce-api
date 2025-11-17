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
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { CreateProductDto } from './dto/created-product.dto';
import { ProductDto, PaginatedProductsDto } from './dto/product.dto';
import { Roles } from 'src/auth/decorators/roles.decoretor';
import { ProductSort } from './dto/list-product.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List products' })
  @ApiOkResponse({
    description: 'Paginated list of products',
    type: PaginatedProductsDto,
  })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'category', required: false, description: 'Category slug' })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Skip amount',
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Take amount',
    type: Number,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'Sort order',
    enum: ProductSort,
  })
  @ApiQuery({
    name: 'min',
    required: false,
    description: 'Minimum price in cents',
    type: Number,
  })
  @ApiQuery({
    name: 'max',
    required: false,
    description: 'Maximum price in cents',
    type: Number,
  })
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
  @ApiOperation({ summary: 'Get a product by slug' })
  @ApiParam({ name: 'slug', description: "Product's slug" })
  @ApiOkResponse({ description: 'Product returned', type: ProductDto })
  @ApiNotFoundResponse({
    description: 'Product not found',
    type: ErrorResponseDto,
  })
  bySlug(@Param('slug') slug: string) {
    return this.productsService.bySlug(slug);
  }

  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiCreatedResponse({ description: 'Created product', type: ProductDto })
  @ApiBadRequestResponse({
    description: 'Invalid input',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @Post()
  @ApiBody({ type: CreateProductDto })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: "Product's UUID" })
  @ApiOkResponse({ description: 'Updated product', type: ProductDto })
  @ApiBadRequestResponse({
    description: 'Invalid input',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateProductDto>) {
    return this.productsService.update(id, dto);
  }

  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: "Product's UUID" })
  @ApiOkResponse({ description: 'Deleted product', type: ProductDto })
  @ApiNotFoundResponse({
    description: 'Product not found',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: ErrorResponseDto,
  })
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
