import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/created-product.dto';
import { ProductSort, ListProductsQuery } from './dto/list-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ProductDto,
  CategoryDto,
  ProductVariantDto,
  PaginatedProductsDto,
} from './dto/product.dto';
import type { Prisma, Product, Category, ProductVariant } from '@prisma/client';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private mapProductToDto(
    product: Product & {
      category?: Category | null;
      variants?: ProductVariant[];
    },
  ): ProductDto {
    return {
      id: product.id,
      title: product.title,
      description: product.description || undefined,
      priceCents: product.priceCents,
      active: product.active,
      categoryId: product.categoryId || undefined,
      category: product.category
        ? this.mapCategoryToDto(product.category)
        : undefined,
      variants: product.variants
        ? product.variants.map((v) => this.mapVariantToDto(v))
        : undefined,
    };
  }

  private mapCategoryToDto(category: Category): CategoryDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
    };
  }

  private mapVariantToDto(variant: ProductVariant): ProductVariantDto {
    return {
      id: variant.id,
      sku: variant.sku,
      stock: variant.stock,
    };
  }

  async list(qs: ListProductsQuery): Promise<PaginatedProductsDto> {
    const {
      q,
      category,
      min,
      max,
      skip = 0,
      take = 20,
      sort = ProductSort.TITLE_ASC,
    } = qs;

    this.logger.log(
      `list() called — q=${q ?? '-'} category=${category ?? '-'} skip=${skip} take=${take} sort=${sort}`,
    );

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === ProductSort.TITLE_DESC
        ? { title: 'desc' }
        : sort === ProductSort.PRICE_ASC
          ? { priceCents: 'asc' }
          : sort === ProductSort.PRICE_DESC
            ? { priceCents: 'desc' }
            : { title: 'asc' };

    const where: Prisma.ProductWhereInput = {
      active: true,
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {},
        category ? { category: { slug: category } } : {},
        min != null ? { priceCents: { gte: min } } : {},
        max != null ? { priceCents: { lte: max } } : {},
      ],
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take,
        include: { category: true, variants: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    this.logger.log(`list() returned ${items.length} items (total=${total})`);

    return {
      items: items.map((item) => this.mapProductToDto(item)),
      total,
      skip,
      take,
    };
  }

  async bySlug(slug: string): Promise<ProductDto | null> {
    this.logger.log(`bySlug() called — slug=${slug}`);

    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { variants: true, category: true },
    });

    return product ? this.mapProductToDto(product) : null;
  }

  async create(dto: CreateProductDto): Promise<ProductDto> {
    this.logger.log(`create() called — title=${dto.title}`);

    const created = await this.prisma.product.create({ data: dto });

    this.logger.log(`create() success — id=${created.id}`);
    return this.mapProductToDto(created);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDto> {
    this.logger.log(`update() called — id=${id}`);

    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) {
      this.logger.warn(`update() failed — product not found id=${id}`);
      throw new NotFoundException('Product not found');
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true, variants: true },
    });
    this.logger.log(`update() success — id=${updated.id}`);
    return this.mapProductToDto(updated);
  }

  async delete(id: string): Promise<ProductDto> {
    this.logger.log(`delete() called — id=${id}`);

    const exists = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, variants: true },
    });
    if (!exists) {
      throw new NotFoundException('Product not found');
    }

    const deleted = await this.prisma.product.delete({ where: { id } });
    this.logger.log(`delete() success — id=${deleted.id}`);
    return this.mapProductToDto({
      ...deleted,
      category: exists.category,
      variants: exists.variants,
    });
  }
}
